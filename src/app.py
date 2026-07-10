#!usr/bin/env python

import json
import logging
import os
import sys
from logging import INFO
from os import environ
from signal import signal as onSignal, SIGINT
from threading import Timer

import tornado
from flask import Flask, render_template, redirect, request, session
from tornado.options import parse_command_line
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer

from src.backend.handlers.chatHandler import ChatHandler, getChatSocketConnections
from src.backend.handlers.chessHandler import ChessHandler, getChessSocketConnections
from src.backend.handlers.quadHandler import QuadHandler, getQuadSocketConnections
from src.backend.handlers.statHandler import StatHandler
from src.backend.handlers.tttHandler import TttHandler, getTttSocketConnections
from src.backend.pgdb import Pgdb
from src.backend.services.chess.ChessGame import createChessGame
from src.backend.services.common import validator
from src.backend.services.common.User import createUser
from src.backend.services.common.emailSender import sendPasswordResetEmail
from src.backend.services.common.validator import ValidationError
from src.backend.services.quad.QuadGame import createQuadGame
from src.backend.services.ttt.TttGame import createTttGame
from src.backend.utils import notLoggedIn, buildPreferences, generateId, isEmpty

app = Flask(__name__, static_folder="frontend", static_url_path='/frontend', template_folder="frontend/templates")

try:
    config = json.loads(open("resources/app_config.json", "r").read())
    host = config['host']
    port = config['port']
    wsProtocol = config['websocket']['protocol']
    wsBaseUrl = wsProtocol + "://" + host + "/ws"
    app.secret_key = config['secret_key']
    pgdb = Pgdb(config['postgres'])

except FileNotFoundError:
    print("you need to add resources/app_config.json for the server to run.")
    exit()
except KeyError as ke:
    print("app_config missing a key:", ke.args[0])
    exit()

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s - %(message)s (%(filename)s:%(lineno)s)'))
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(INFO)

with app.test_request_context():
    logging.info("session cleared")
    session.clear()

# clear out any reset tokens on startup in case the app crashed during the timeout window
pgdb.clearPwResetTokens()
logging.info("password reset tokens cleared")

@app.route('/')
def homepage():

    if notLoggedIn(session):
        payload = json.dumps(basePayload(), default=str)
        return render_template("splash.html", payload = payload)

    else:
        username = session.get('username')
        chessGames, tttGames, quadGames = pgdb.getAllGames(username)

        homePayload = {
            "chessGames": chessGames,
            "tttGames": tttGames,
            "quadGames": quadGames
        }
        payload = json.dumps(basePayload() | homePayload, default=str)
        return render_template("/home.html", payload=payload)


@app.route('/games/chess/<gameId>')
def chessGame(gameId):
    game = pgdb.getChessGame(gameId)
    username = session.get('username')
    if game is None:
        payload = json.dumps(basePayload(), default=str)
        return render_template("gameNotFound.html", payload=payload)

    colors = {game.white_player: "White", game.black_player: "Black"}
    userColor = colors.get(username) # defaults to None if user is not a player (not logged in, other acct, etc.)

    chessPayload = {
        "game_type": "chess", # used in WebSocketConnect for chatSocket
        "game": vars(game),
        "userColor": userColor
    }
    payload = json.dumps(basePayload() | chessPayload, default=str)

    return render_template("chessGame.html", payload=payload)

@app.route("/games/quad/<gameId>")
def quadGame(gameId):
    game = pgdb.getQuadradiusGame(gameId)
    if game is None:
        payload = json.dumps(basePayload(), default=str)
        return render_template("gameNotFound.html", payload=payload)

    quadGamePayload = {
        "game_type": "quadradius",
        "game": vars(game)
    }

    payload = json.dumps(basePayload() | quadGamePayload, default=str)
    return render_template("quadGame.html", payload=payload)


@app.route('/games/ttt/<gameId>')
def tttGame(gameId):

    game = pgdb.getTttGame(gameId)

    if game is None:
        payload = json.dumps(basePayload(), default=str)
        return render_template("gameNotFound.html", payload=payload)

    tttPayload = {
        "game_type": "ttt", # used in WebSocketConnect for chatSocket
        "game": vars(game),
    }
    payload = json.dumps(basePayload() | tttPayload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():

    try:
        validator.validateLogin(request)
    except ValidationError as ve:
        return ve.message

    input_username = request.form['username']

    existingUser = pgdb.getUser(input_username)

    session['loggedIn'] = True
    session['username'] = existingUser.name
    session['userId'] = existingUser.id # probably not doing anything
    return redirect('/')



@app.route('/signup', methods=["POST"])
def signup():

    try:
        validator.validateSignup(request)
    except ValidationError as ve:
        return ve.message

    username = request.form['username']
    email = request.form['email']
    password = request.form['password']

    createUser(email, password, username)

    session['loggedIn'] = True
    session['username'] = request.form['username']
    return redirect('/')

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect("/")

@app.route("/create-game", methods=["POST"])
def createGame():

    try:
        validator.validateCreateGame(request)
    except ValidationError as ve:
        return ve.message

    player_name = session['username']
    opponent_name = request.form['opponent'].strip()
    game_type = request.form['gameType']

    opponent = pgdb.getUser(opponent_name)
    opponent_name = opponent.name # postgres lower() ensures case-insensitive username handling

    match game_type:
        case "Ttt":   createTttGame(player_name, opponent_name)
        case "Quad":  createQuadGame(player_name, opponent_name)
        case "Chess": createChessGame(player_name, opponent_name)

    return redirect('/')

@app.route("/update_settings", methods=["PATCH"])
def updateSettings():

    body = request.json
    try:
        validator.validateUpdateSettings(request.json)
    except ValidationError as ve:
        return ve.message, ve.code

    setting = body["setting"]
    username = body["username"]
    value = body["value"]

    pgdb.updateSetting(setting, value, username)
    return "ACCEPTED", 202


@app.route("/request_password_reset", methods=["PATCH"])
def requestPasswordReset():

    body = request.json
    username = body['username']

    user = pgdb.getUser(username)
    if user is None:
        return "User not found", 400

    if isEmpty(user.email):
        return "No email address associated with that account", 400

    token = str(generateId()).replace('-', '')[:20] # should this be cryptographically tied to the user?
    pgdb.setPwResetToken(username, token)
    ### TODO #66.II.1.a send password reset email to user

    Timer(60*15, pgdb.removePwResetToken, [username]).start()

    return "OK", 200

@app.route("/perform_password_reset/<token>")
def performPasswordReset(token):

    user = pgdb.getUserByToken(token)
    ## TODO Issue #66.2.1.2: page for performing password reset. the receiving of the new PW will come in a separate fn I guess

    # pgdb.removePwResetToken(username)

    return render_template("performPasswordReset.html")

def basePayload():

    deployVersion = environ.get('DEPLOY_VERSION', default="Local")
    username = session.get('username') # session fields will be None if not logged in
    user = pgdb.getUser(username)
    ws_token = user.ws_token if user is not None else None

    return {
        "deployVersion": deployVersion,
        "username": username,
        "wsBaseUrl": wsBaseUrl,
        "ws_token": ws_token,
        "preferences": buildPreferences(user)
    }

if __name__ == "__main__":

    flaskApp = WSGIContainer(app)
    application = Application(
        default_host=host,
        handlers=[
            ("/ws/ttt",   TttHandler),
            ("/ws/chat",  ChatHandler),
            ("/ws/stat",  StatHandler),
            ("/ws/quad",  QuadHandler),
            ("/ws/chess", ChessHandler),
            (".*",        FallbackHandler, {"fallback": flaskApp})
        ]
    )
    application.listen(port)
    logging.info("listening for secure websocket requests to " + host)

    logging.info("---running Flask server on port " + str(port) + "---")

    parse_command_line()
    onSignal(SIGINT, lambda signum, frame: tornado.ioloop.IOLoop.instance().stop())
    application.listen(8888)

    tornado.ioloop.IOLoop.instance().start() #runs until stopped
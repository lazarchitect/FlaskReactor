#!usr/bin/env python

import json
import random
from os import environ
from signal import signal as onSignal, SIGINT

import tornado
from flask import Flask, render_template, redirect, request, session
from tornado.options import parse_command_line
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer

from src.backend.handlers.chatHandler import ChatHandler
from src.backend.handlers.chessHandler import ChessHandler
from src.backend.handlers.quadHandler import QuadHandler
from src.backend.handlers.statHandler import StatHandler
from src.backend.handlers.tttHandler import TttHandler
from src.backend.models.ChessGame import newChessGame
from src.backend.models.QuadradiusGame import newQuadradiusGame
from src.backend.models.TttGame import newTttGame
from src.backend.models.User import newUser
from src.backend.pgdb import Pgdb
from src.backend.utils import generateId, generateHash, notLoggedIn, buildPreferences

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

with app.test_request_context():
    print("session cleared")
    session.clear()

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
        return render_template("game_not_found.html", payload=payload)

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
        return render_template("game_not_found.html", payload=basePayload(), default=str)

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
        return render_template("game_not_found.html", payload=json.dumps(basePayload(), default=str))

    tttPayload = {
        "game_type": "ttt", # used in WebSocketConnect for chatSocket
        "game": vars(game),
    }
    payload = json.dumps(basePayload() | tttPayload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():
    input_username = request.form['username']
    input_password = request.form['password']
    input_password_hash = generateHash(input_password)

    existingUser = pgdb.getUser(input_username)

    if existingUser is None:
        return "User " + input_username + " does not exist."

    correctPassword = input_password_hash == existingUser.password_hash
    if correctPassword:
        session['loggedIn'] = True
        session['username'] = existingUser.name
        session['userId'] = existingUser.id # probably not doing anything
        session['ws_token'] = existingUser.ws_token
        return redirect('/')
    else:
        return "Username or password incorrect. Please check your details and try again."


@app.route('/signup', methods=["POST"])
def signup():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    password_repeat = request.form['password_repeat']

    if password != password_repeat:
        return "Your passwords did not match."

    usernameTaken = pgdb.getUser(username) is not None
    if usernameTaken:
        return "That username is taken! sorry fam"

    password_hash = generateHash(password)

    ws_token = str(generateId())[:8]

    user = newUser(username, password_hash, email, ws_token)
    pgdb.createUser(user)
    pgdb.createStat(user['id']) # can align this with other create fns later

    session['loggedIn'] = True
    session['username'] = request.form['username']
    session['ws_token'] = ws_token
    return redirect('/')

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect("/")

@app.route("/create-game", methods=["POST"])
def createGame():

    # TODO refactoring /create-game into smaller subroutines
    #  There should be a widespread service layer to handle back end service logic. This file should focus on app setup and routing.
    #  Bad input handling can be handled outside this file.
    #  game_type should be a match/case statement with subfunctions in other files
    #  In general, we should stop adding meaningful logic (beyond basic endpoint routing) to app.py, this file is getting huge.

    player_name = session['username']

    game_type = request.form['gameType']

    opponent_name = request.form['opponent'].strip()

    if session.get('loggedIn') == False:
        return "not logged in?" # shouldn't happen

    if opponent_name == "":
        return "enter a name, doofbury."

    if player_name == opponent_name:
        return "you can't vs yourself, bubso."

    opponent = pgdb.getUser(opponent_name)

    if opponent is None:
        return "We didn't find a user with that name. Check spelling and special characters."

    opponent_name = opponent.name # if the user typed in wrongly cased letters, we silently fix it here

    if game_type == "Chess":
        color = random.choice(['white', 'black'])

        if color == "white":
            white_player = player_name
            black_player = opponent_name

        else:
            white_player = opponent_name
            black_player = player_name

        game = newChessGame(white_player, black_player)

        pgdb.createChessGame(game)

    elif game_type == "Ttt":
        role = random.choice(['X', 'O'])
        if role == 'X':
            x_player = player_name
            o_player = opponent_name
        else:
            o_player = player_name
            x_player = opponent_name

        game = newTttGame(x_player, o_player)

        pgdb.createTttGame(game)

    elif game_type == "Quad":

        playerColorPrefs = pgdb.getPreferredTorusColors(player_name)
        opponentColorPrefs = pgdb.getPreferredTorusColors(opponent_name)

        if playerColorPrefs['quad_color_pref'] != opponentColorPrefs['quad_color_pref']:
            player_color = playerColorPrefs['quad_color_pref']
            opponent_color = opponentColorPrefs['quad_color_pref']
        else:
            if random.choice(["Heads", "Tails"]) == "Heads":
                player_color = playerColorPrefs['quad_color_pref']
                opponent_color = opponentColorPrefs['quad_color_backup']
            else:
                player_color = playerColorPrefs['quad_color_backup']
                opponent_color = opponentColorPrefs['quad_color_pref']

        players = [[player_name, player_color], [opponent_name, opponent_color]]
        random.shuffle(players)

        print(players)

        game = newQuadradiusGame(
            player1=players[0][0],
            player2=players[1][0],
            player1_color=players[0][1],
            player2_color=players[1][1],
            active_player=players[0][0])

        pgdb.createQuadradiusGame(game)

    return redirect('/')

@app.route("/update_settings", methods=["PATCH"])
def updateSettings():

    body = request.json
    username = body.get("username")
    ws_token = body.get("ws_token")
    setting = body.get("setting")

    user = pgdb.getUser(username)
    if user.ws_token != ws_token:
        return "UNAUTHORIZED", 401

    VALID_SETTINGS = ['quad_color_pref', 'quad_color_backup', 'use_chat']

    if setting in VALID_SETTINGS:
        value = body["data"]["value"]
        pgdb.updateSetting(setting, value, username)

    return "ACCEPTED", 202

def basePayload():

    deployVersion = environ.get('DEPLOY_VERSION', default="Local")
    username = session.get('username') # session fields will be None if not logged in

    return {
        "deployVersion": deployVersion,
        "username": username,
        "wsBaseUrl": wsBaseUrl,
        "ws_token": session.get('ws_token'),
        "preferences": buildPreferences(pgdb.getUser(username))
    }


if __name__ == "__main__":

    flaskApp = WSGIContainer(app)
    application = Application(
        default_host=host,
        handlers=[
            ("/ws/ttt",   TttHandler),
            ("/ws/chat",  ChatHandler,     {"pgdb": pgdb}),
            ("/ws/stat",  StatHandler,     {"pgdb": pgdb}),
            ("/ws/quad",  QuadHandler,     {"pgdb": pgdb}),
            ("/ws/chess", ChessHandler,    {"pgdb": pgdb}),
            (".*",        FallbackHandler, {"fallback": flaskApp})
        ]
    )
    application.listen(port)
    print("listening for secure websocket requests to " + host)

    print("---running server on port " + str(port) + "---")

    parse_command_line()
    onSignal(SIGINT, lambda signum, frame: tornado.ioloop.IOLoop.instance().stop())
    application.listen(8888)

    tornado.ioloop.IOLoop.instance().start() #runs until stopped
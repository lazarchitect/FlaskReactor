#!usr/bin/env python

from flask import Flask, render_template, redirect, request, session
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from tornado.options import parse_command_line
from signal import signal, SIGINT
import tornado
import random
import json
import os

from src.pgdb import Pgdb
from src.utils import generateId, generateHash, notLoggedIn, buildPreferences
from src.models.ChessGame import ChessGame
from src.models.TttGame import TttGame
from src.models.QuadradiusGame import QuadradiusGame
from src.handlers.tttHandler import TttHandler
from src.handlers.statHandler import StatHandler
from src.handlers.chessHandler import ChessHandler
from src.handlers.chatHandler import ChatHandler

app = Flask(__name__)

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

try:
    deployVersion = os.environ['DEPLOY_VERSION']
except KeyError:
    deployVersion = "Local"

with app.test_request_context():
    session.clear()

@app.route('/')
def homepage():

    if notLoggedIn(session):
        payload = json.dumps({"deployVersion": deployVersion})
        return render_template("splash.html", payload = payload)

    else:
        chessGames, tttGames, quadradiusGames = pgdb.getAllGames(session.get('username'))

        payload = {
            "username": session.get('username'),
            "preferences": buildPreferences(session),
            "chessGames": chessGames,
            "tttGames": tttGames,
            "quadradiusGames": quadradiusGames,
            "deployVersion": deployVersion
        }
        payload = json.dumps(payload, default=str)
        return render_template("home.html", payload=payload)


@app.route('/games/chess/<gameId>')
def chessGame(gameId):
    game = pgdb.getChessGame(gameId)

    if game is None:
        return "game with that ID was not found"#render_template("home.html", alert="Game could not be retrieved from database.")

    username = session.get('username')

    colors = {game.white_player: "White", game.black_player: "Black"}
    userColor = colors.get(username) # defaults to None if user is not a player (not logged in, other acct, etc.)
    enemyColor = "Black" if userColor == "White" else ("White" if userColor == "Black" else None)

    payload = {
        "game": vars(game),
        "username": username,
        "game_type": "chess", # field used by common component

        # TODO following three lines' values already derive from "game" and "username", redundant payload fields. let UI figure it out
        "boardstate": game.boardstate,
        "players": [game.white_player, game.black_player],
        "yourTurn": game.player_turn == session.get('username'),

        "wsBaseUrl": wsBaseUrl,
        "ws_token": session.get('ws_token'),
        "userColor": userColor,
        "enemyColor": enemyColor,
        "deployVersion": deployVersion
    }
    payload = json.dumps(payload, default=str)

    return render_template("chessGame.html", payload=payload)

@app.route("/games/quadradius/<gameId>")
def quadGame(gameId):
    game = pgdb.getQuadradiusGame(gameId)
    payload = {
        "deployVersion": deployVersion,
        "wsBaseUrl": wsBaseUrl,
        "game": vars(game),
        "username": session.get('username'), #can be null if not logged in
        "userId": session.get('userId'),
        "game_type": "quadradius",
        "ws_token": session.get('ws_token'),
        "yourTurn": game.active_player == session.get('username')
    }

    payload = json.dumps(payload, default=str)
    return render_template("quadGame.html", payload=payload)


@app.route('/games/ttt/<gameId>')
def tttGame(gameId):
    game = pgdb.getTttGame(gameId)
    if game is None:
        return "No game found with that ID."
    payload = {
        "wsBaseUrl": wsBaseUrl,
        "game": vars(game),
        "ws_token": session.get('ws_token'),
        "game_type": "ttt", # field used by common component
        "username": session.get('username'), #can be null if not logged in
        "userId": session.get('userId'),
        # TODO next three lines are not explicitly needed, they are already in "game"
        "otherPlayer": game.o_player if session.get('username') == game.x_player else game.x_player,
        "players": [game.x_player, game.o_player],
        "yourTurn": game.player_turn == session.get('username'),
        "deployVersion": deployVersion
    }
    payload = json.dumps(payload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():
    # TODO we query the DB three times here - we could reduce to 1 by checking password_hash and userExists here
    #  instead of through pgdb. pgdb.UserExists doesnt need to exist, just use a clearly named boolean.
    username = request.form['username']
    password = request.form['password']
    password_hash = generateHash(password)

    if not pgdb.userExists(username):
        return "User " + username + " does not exist."

    correctLogin = pgdb.checkLogin(username, password_hash)
    if(correctLogin):
        user = pgdb.getUser(username)
        session['loggedIn'] = True
        session['username'] = username
        session['userId'] = user.id
        session['ws_token'] = user.ws_token
        session['quadColorPref'] = user.quad_color_pref
        session['quadColorBackup'] = user.quad_color_backup
        return redirect('/')
    else:
        return "Username or password incorrect. Please check your details and try again."


@app.route('/signup', methods=["POST"])
def signup():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    password_repeat = request.form['password_repeat']

    if(password != password_repeat):
        return ("Your passwords did not match.")

    usernameTaken = pgdb.userExists(username)
    if(usernameTaken):
        return("That username is taken! sorry fam")

    password_hash = generateHash(password)

    userid = str(generateId())
    ws_token = str(generateId())[:8]

    quad_color_pref = "red" # initial defaults
    quad_color_backup = "blue"

    pgdb.createUser(username, password_hash, email, userid, ws_token, quad_color_pref, quad_color_backup)
    pgdb.createStat(userid)

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
    # bad input handling can be handled outside this file
    # game_type should be a match/case statement with subfunctions in other files
    # we should stop adding meaningful logic (beyond basic endpoint routing) to app.py, this file is getting huge.

    player_name = session['username']

    game_type = request.form['gameType']

    opponent_name = request.form['opponent'].strip()

    if(session.get('loggedIn') == False):
        return "not logged in?"#shouldnt happen

    if(opponent_name == ""):
        return "enter a name, doofbury."

    if(player_name == opponent_name):
        return "you can't vs yourself, bubso."

    opponentExists = pgdb.userExists(opponent_name)
    if(opponentExists == False):
        return "no user by that name. try again or message me if this is incorrect."

    if game_type == "Chess":
        color = random.choice(['white', 'black'])

        if(color == "white"):
            white_player = player_name
            black_player = opponent_name

        else:
            white_player = opponent_name
            black_player = player_name

        game = ChessGame.manualCreate(white_player, black_player)

        pgdb.createChessGame(game)

    elif game_type == "Tic-Tac-Toe":
        role = random.choice(['X', 'O'])
        if(role == 'X'):
            x_player = player_name
            o_player = opponent_name
        else:
            o_player = player_name
            x_player = opponent_name

        game = TttGame.manualCreate(x_player, o_player)

        pgdb.createTttGame(game)

    elif game_type == "Quadradius":

        playerColorPrefs = pgdb.getPreferredTorusColors(player_name)
        opponentColorPrefs = pgdb.getPreferredTorusColors(opponent_name)

        # TODO use .get(str, default) (and make the field name better?)
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

        game = QuadradiusGame.manualCreate(players[0][0], players[1][0], players[0][1], players[1][1], active_player=players[0][0]) # users will be able to update their preferred & backup Torus colors
        pgdb.createQuadradiusGame(game)

    return redirect('/')

@app.route("/receive_settings", methods=["PATCH"])
def receiveSettings():
    # todo authenticate (session?)
    body = request.json
    username = body["username"]
    match(body.get("command", None)):
        case "quadColorPref":
            color = body["data"]["color"]
            pgdb.updateSetting("quad_color_pref", color, username)
        case "quadColorBackup":
            color = body["data"]["color"]
            pgdb.updateSetting("quad_color_backup", color, username)
    return "ACCEPTED", 202

is_closing = False

def signal_handler(signum, frame):
    global is_closing
    is_closing = True

def try_exit():
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()

if __name__ == "__main__":

    flaskApp = WSGIContainer(app)
    application = Application(
        default_host=host,
        handlers=[
            ("/ws/ttt",     TttHandler,      {"pgdb": pgdb}),
            ("/ws/chat",    ChatHandler,     {"pgdb": pgdb}),
            ("/ws/stat",    StatHandler,     {"pgdb": pgdb}),
            ("/ws/chess",   ChessHandler,    {"pgdb": pgdb}),
            (".*",          FallbackHandler, {"fallback": flaskApp})
        ]
    )
    application.listen(port)
    print("listening for secure websocket requests to " + host)

    print("---running server on port " + str(port) + "---")

    parse_command_line()
    signal(SIGINT, signal_handler)
    application.listen(8888)
    tornado.ioloop.PeriodicCallback(try_exit, 1000).start()

    tornado.ioloop.IOLoop.instance().start() #runs until killed

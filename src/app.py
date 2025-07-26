#!usr/bin/env python

from flask import Flask, render_template, redirect, request, session
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from tornado.options import parse_command_line
from signal import signal, SIGINT
from sys import argv
import tornado
import random
import json
import os

from src.pgdb import Pgdb
from src.FakePgdb import FakePgdb
from src.utils import generateId, generateHash
from src.models.ChessGame import ChessGame
from src.models.TttGame import TttGame
from src.handlers.tttHandler import TttHandler
from src.handlers.statHandler import StatHandler
from src.handlers.chessHandler import ChessHandler
from src.handlers.messageHandler import MessageHandler

try:
    wsDetails = json.loads(open("resources/wsdetails.json", "r").read())
    port = wsDetails['port']
    host = wsDetails['host']
    wsProtocol = wsDetails['protocol']
    wsBaseUrl = wsProtocol + "://" + host + "/ws"

except FileNotFoundError:
    print("you need to add resources/wsdetails.json for the server to run.")
    exit(1)
except KeyError as ke:
    print("wsdetails.json file missing a key:", ke.args[0])
    exit()

app = Flask(__name__)

try:
    appVersion = os.environ['DEPLOY_VERSION']
except KeyError:
    appVersion = "DEV"

try:
    app.secret_key = open('resources/secret_key.txt', 'r').read().encode('utf-8')
except FileNotFoundError:
    print("you need to add a file called resources/secret_key.txt, containing a secret (private string) for Flask to run.")
    exit()

@app.route('/')
def homepage():

    print(session)

    if(session.get('loggedIn') == False or session.get('loggedIn') == None):
        return render_template("splash.html")

    else: # user is logged in
        chessGames = pgdb.getChessGames(session.get('username'))
        tttGames = pgdb.getTttGames(session.get('username'))
        payload = {
            "username": session.get('username'),
            "chessGames": chessGames,
            "tttGames": tttGames,
            "deployVersion": appVersion
        }
        payload = json.dumps(payload, default=str)
        return render_template("home.html", payload=payload)


@app.route('/games/chess/<gameid>')
def chessGame(gameid):
    game = pgdb.getChessGame(gameid)

    if game == None:
        return "game with that ID was not found"#render_template("home.html", alert="Game could not be retrieved from database.")

    username = session.get('username')

    colors = {game.white_player: "White", game.black_player: "Black"}
    userColor = colors.get(username)
    enemyColor = "Black" if userColor == "White" else "White"

    payload = {
        "wsBaseUrl": wsBaseUrl,
        "game": vars(game),
        "boardstate": game.boardstate,
        "username": username,
        "userColor": userColor,
        "enemyColor": enemyColor,
        "yourTurn": game.player_turn == session.get('username'),
        "deployVersion": appVersion
    }
    payload = json.dumps(payload, default=str)

    return render_template("chessGame.html", payload=payload)

@app.route("/games/quadradius/<gameid>")
def quadGame(gameid):
    # TODO: configure database storage of quadradius objects (seems like a whole issue itself)
    #game = pgdb.getQuadGame(gameId)
    payload = {
        "deployVersion": "DEV",
        # "wsBaseUrl": wsBaseUrl,
        # "game": vars(game),
        "boardstate": json.loads(open('resources/initialQuadLayout.json', 'r').read())
        # "username": session.get('username'), #can be null if not logged in
        # "userId": session.get('userId'),
        # "otherPlayer": game.o_player if session.get('username') == game.x_player else game.x_player,
        # "yourTurn": game.player_turn == session.get('username')
    }

    # print(payload)

    payload = json.dumps(payload, default=str)
    return render_template("quadGame.html", payload=payload)


@app.route('/games/ttt/<gameid>')
def tttGame(gameid):
    game = pgdb.getTttGame(gameid)
    if game == None: 
        return "No game found with that ID."
    payload = {
        "wsBaseUrl": wsBaseUrl,
        "game": vars(game),
        "username": session.get('username'), #can be null if not logged in
        "userId": session.get('userId'),
        "otherPlayer": game.o_player if session.get('username') == game.x_player else game.x_player,
        "yourTurn": game.player_turn == session.get('username'),
        "deployVersion": appVersion
    }
    payload = json.dumps(payload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():
    username = request.form['username']
    password = request.form['password']
    password_hash = generateHash(password)

    if not pgdb.userExists(username):
        return "User " + username + " does not exist."

    correctLogin = pgdb.checkLogin(username, password_hash)
    if(correctLogin):
        userId = pgdb.getUser(username)[2]
        session['loggedIn'] = True
        session['username'] = username
        session['userId'] = userId
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

    pgdb.createUser(username, password_hash, email, userid)
    pgdb.createStat(userid)

    session['loggedIn'] = True
    session['username'] = request.form['username']
    return redirect('/')

@app.route("/logout", methods=["POST"])
def logout():
    session['loggedIn'] = False
    if 'username' in session:
        del session['username']
    if 'userId' in session:
        del session['userId']
    return redirect("/")

@app.route("/creategame", methods=["POST"])
def createGame():

    # TODO refactoring: the remainder of this function seems like it should live in its own class

    game_type = request.form['gameType']

    opponent_name = request.form['opponent']

    if(session.get('loggedIn') == False):
        return "not logged in?"#shouldnt happen

    if(opponent_name == ""):
        return "enter a name, doofbury."

    if(session.get('username') == opponent_name):
        return "you can't vs yourself, bubso."

    opponentExists = pgdb.userExists(opponent_name)
    if(opponentExists == False):
        return "no user by that name. try again or message me if this is incorrect."

    if game_type == "Chess":
        color = random.choice(['white', 'black'])

        if(color == "white"):
            white_player = session.get('username')
            black_player = opponent_name

        else:
            white_player = opponent_name
            black_player = session.get('username')

        game = ChessGame.manualCreate(white_player, black_player)

        pgdb.createChessGame(game)

    elif game_type == "Tic-Tac-Toe":
        role = random.choice(['X', 'O'])
        if(role == 'X'):
            x_player = session.get('username')
            o_player = opponent_name
        else:
            o_player = session.get('username')
            x_player = opponent_name

        game = TttGame.manualCreate(x_player, o_player)

        pgdb.createTttGame(game)

    return redirect('/')


is_closing = False

def signal_handler(signum, frame):
    global is_closing
    is_closing = True

def try_exit():
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()

if __name__ == "__main__":

    print()

    try:
        db_env = argv[1]
    except IndexError:
        db_env = "no_db"

    print("listening for secure websocket requests to " + host)
    print("connecting to: " + db_env)
    pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()

    flaskApp = WSGIContainer(app)
    application = Application(
        default_host=host,
        handlers=[
            ("/ws/ttt",     TttHandler,      dict(db_env=db_env)),
            ("/ws/stat",    StatHandler,     dict(db_env=db_env)),
            ("/ws/chess",   ChessHandler,    dict(db_env=db_env)),
            ("/ws/message", MessageHandler,  dict(db_env=db_env)),
            (".*",          FallbackHandler, dict(fallback=flaskApp))
        ]
    )
    application.listen(port)

    print("---running server on port " + str(port) + "---")

    parse_command_line()
    signal(SIGINT, signal_handler)
    application.listen(8888)
    tornado.ioloop.PeriodicCallback(try_exit, 1000).start()

    tornado.ioloop.IOLoop.instance().start() #runs until killed

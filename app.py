#!usr/bin/env python

from models.TttGame import TttGame
from flask import Flask, render_template, redirect, request
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from sys import argv
import tornado
import random
import json
from models.Game import Game
from pgdb import Pgdb
from FakePgdb import FakePgdb
from utils import generateId, generateHash
from socketeer import Socketeer

host = "127.0.0.1"
port = 5000

### flask sessions save cookies in browser, which is better but annoying for development. TODO toggle this later.
# from flask import session
session = {'loggedIn':False}

app = Flask(__name__)

try:
    app.secret_key = open('secret_key.txt', 'r').read()
except FileNotFoundError:
    print("you need to add a file called secret_key.txt, containing a random bytestring, for the app to work.")
    exit()

@app.route('/')
def homepage():

    if(session['loggedIn'] == False):
        return render_template("splash.html")

    else: # user is logged in
        chessGames = pgdb.getActiveGames(session['username'])
        tttGames = pgdb.getTttGames(session['username'])
        payload = {
            "username": session['username'],
            "chessGames": chessGames,
            "tttGames": tttGames
        }
        payload = json.dumps(payload, default=str)
        return render_template("home.html", payload=payload)


@app.route('/games/chess/<gameid>')
def chessGame(gameid):
    game = pgdb.getGame(gameid)

    if(game != None): return render_template("game.html", gamestate = game.boardstate)

    else: return render_template("home.html", alert="Game could not be retrieved from database.")

@app.route('/games/ttt/<gameid>')
def tttGame(gameid):
    tttGame = pgdb.getTttGame(gameid)
    payload = {
        "tttGame": tttGame
    }
    payload = json.dumps(payload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():
    username = request.form['username']
    password = request.form['password']
    password_hash = generateHash(password)

    correctLogin = pgdb.checkLogin(username, password_hash)
    if(correctLogin):
        session['loggedIn'] = True
        session['username'] = username
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
    # assert 'username' in session
    if 'username' in session: #IT SHOULD BE THERE. TODO REMOVE THIS IF STATEMENT AFTER DEVELOPMENT 
        del session['username']
    return redirect("/")

@app.route("/creategame", methods=["POST"])
def createGame():

    game_type = request.form['gameType']

    opponent_name = request.form['opponent']

    if(session['loggedIn'] == False):
        return "not logged in?"#shouldnt happen

    if(opponent_name == ""):
        return "enter a name, doofbury."

    if(session['username'] == opponent_name):
        return "you can't vs yourself, bubso."

    opponentExists = pgdb.userExists(opponent_name)
    if(opponentExists == False):
        return "no user by that name. try again or message me if this is incorrect."

    if game_type == "Chess":
        color = random.choice(['white', 'black'])

        if(color == "white"):
            white_player = session['username']
            black_player = opponent_name

        else:
            white_player = opponent_name
            black_player = session['username']

        game = Game.manualCreate(white_player, black_player)

        pgdb.createGame(game)

    elif game_type == "Tic-Tac-Toe":
        role = random.choice(['X', 'O'])
        if(role == 'X'):
            x_player = session['username']
            o_player = opponent_name
        else:
            o_player = session['username']
            x_player = opponent_name

        game = TttGame.manualCreate(x_player, o_player)

        pgdb.createTttGame(game)

    return redirect('/')


if __name__ == "__main__":

    print()
    
    try:
        db_env = argv[1]
    except IndexError:
        db_env = "local_db"
    
    if db_env == "no_db":
        pgdb = FakePgdb()

    else:
        pgdb = Pgdb(db_env)

    print("---database connected on " + db_env + "---")

    websocketHanderUrl = "/websocket"
    print("---WebSocketHandler uses "+ websocketHanderUrl+"---")
    print("---running server on " + host + ":" + str(port) + "---")
    container = WSGIContainer(app)
    application = Application([
        (websocketHanderUrl, Socketeer),
        (".*", FallbackHandler, dict(fallback=container))
    ], debug=True)
    application.listen(port)
    tornado.ioloop.IOLoop.instance().start() #runs until killed
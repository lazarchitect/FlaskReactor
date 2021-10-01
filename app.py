#!usr/bin/env python

from models.TttGame import TttGame
from flask import Flask, render_template, redirect, request, session
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from sys import argv
import tornado
import random
import json
from models.ChessGame import ChessGame
from pgdb import Pgdb
from FakePgdb import FakePgdb
from utils import generateId, generateHash
from handlers.tttHandler import TttHandler
from handlers.statHandler import StatHandler
from handlers.chessHandler import ChessHandler

host = "127.0.0.1"
port = 5000

try:
    wssh = json.loads(open("wsdetails.json", "r").read())['wssh']
except:
    print("you need to add wsdetails.json for the site to work.")
    exit(1)


app = Flask(__name__)

try:
    app.secret_key = open('secret_key.txt', 'r').read()
except FileNotFoundError:
    print("you need to add a file called secret_key.txt, containing a random bytestring, for the app to work.")
    exit()

@app.route('/')
def homepage():

    if(session.get('loggedIn') == False or session.get('loggedIn') == None):
        return render_template("splash.html")

    else: # user is logged in
        chessGames = pgdb.getActiveChessGames(session.get('username'))
        tttGames = pgdb.getTttGames(session.get('username'))
        payload = {
            "username": session.get('username'),
            "chessGames": chessGames,
            "tttGames": tttGames
        }
        payload = json.dumps(payload, default=str)
        return render_template("home.html", payload=payload)


@app.route('/games/chess/<gameid>')
def chessGame(gameid):
    game = pgdb.getChessGame(gameid)
    username = session.get('username')
    
    colors = {game.white_player: "White", game.black_player: "Black"}

    payload = {
        "boardstate": game.boardstate["tiles"],
        "username": username,
        "userColor": colors.get(username),
        "yourTurn": game.player_turn == session.get('username')
    }
    payload = json.dumps(payload, default=str)

    if(game != None): return render_template("chessGame.html", payload=payload)

    else: return render_template("home.html", alert="Game could not be retrieved from database.")


@app.route('/games/ttt/<gameid>')
def tttGame(gameid):
    game = pgdb.getTttGame(gameid)
    payload = {
        "wssh": wssh,
        "game": vars(game),
        "username": session.get('username'), #can be null if not logged in
        "userId": session.get('userId'),
        "otherPlayer": game.o_player if session.get('username') == game.x_player else game.x_player,
        "yourTurn": game.player_turn == session.get('username')
    }
    payload = json.dumps(payload, default=str)
    return render_template("tttGame.html", payload=payload)


@app.route('/login', methods=["POST"])
def login():
    username = request.form['username']
    password = request.form['password']
    password_hash = generateHash(password)

    # TODO there are 2 callouts to the db here, only need 1
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
    return redirect("/")

@app.route("/creategame", methods=["POST"])
def createGame():

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


if __name__ == "__main__":

    print()
    
    try:
        db_env = argv[1]
        print("database: " + db_env)
    except IndexError:
        db_env = "local_db"
    
    pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()

    container = WSGIContainer(app)
    application = Application(
        default_host="flaskreactor.com", 
        handlers=[
            ("/ws/ttt", TttHandler, dict(db_env=db_env)),
            ("/ws/stat", StatHandler, dict(db_env=db_env)),
            ("/ws/chess", ChessHandler, dict(db_env=db_env)),
            (".*", FallbackHandler, dict(fallback=container))
        ]
    )
    application.listen(port)

    print("---running server on " + host + ":" + str(port) + "---")

    tornado.ioloop.IOLoop.instance().start() #runs until killed
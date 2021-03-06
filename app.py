from flask import Flask, render_template, redirect, request
from utils import generateId, generateHash
from datetime import datetime
import random
import pgdb
import json
import asyncio
import websockets
import signal
from threading import Thread

socket_port = 5001
socket_host = "localhost"

##websocket server init
async def handleSocketClient(websocket, path):
    async for message in websocket:
        # await websocket.send(message)
        print(message)
        if message == "B3":
            pass

def startSocketServer():
    print("---establishing websocket server---")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.add_signal_handler(signal.SIGTERM, loop.call_soon_threadsafe(exit()), None)
    loop.run_until_complete(websockets.serve(handleSocketClient, socket_host, socket_port))
    loop.run_forever()

socketServerThread = Thread(target = startSocketServer)
socketServerThread.start()

### flask sessions save cookies in browser, which is better but annoying for development. TODO switch this later.
# from flask import session
session = {'loggedIn':False}

app = Flask(__name__)
app.secret_key = open('secret_key.txt', 'r').read()


@app.route('/')
def homepage():

    if(session['loggedIn'] == False):
        return render_template("splash.html")

    else:
        games = pgdb.getActiveGames(session['username'])
        games = json.dumps(games, default=str)
        return render_template("home.html", games = games, username = session['username'])


@app.route('/games/<gameid>')
def game(gameid):
    game = pgdb.getGame(gameid)
    if(game != None): return render_template("game.html", gamestate = game[3])
    else: return render_template("home.html", alert="Game could not be retrieved from database.")


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

    usernameTaken = pgdb.getUser(username) != None
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
    del session['username']
    return redirect("/")

@app.route("/creategame", methods=["POST"])
def createGame():

    opponent_name = request.form['opponent']

    if(session['loggedIn'] == False):
        return #shouldnt happen

    if(session['username'] == opponent_name):
        return "you can't vs yourself, bubso."

    opponentExists = pgdb.getUser(opponent_name) != None
    if(opponentExists == False):
        return "no user by that name. try again or message me if this is incorrect."

    color = random.choice(['white', 'black'])

    if(color == "white"):
        white_player = session['username']
        black_player = opponent_name

    else:
        white_player = opponent_name
        black_player = session['username']

    gameId = generateId()
    completed = False #ongoing
    boardstate = open('initialLayout.json', 'r').read()
    time_started = datetime.now()
    last_move = time_started

    pgdb.createGame(gameId, white_player, black_player, boardstate, completed, time_started, last_move)

    return redirect('/')

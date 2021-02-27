from flask import Flask, render_template, redirect, request
from utils import generateId, generateHash
from datetime import datetime
import random
import pgdb
  


### flask sessions save cookies in browser, which is better but annoying for development. TODO switch this later.
# from flask import session
session = {'loggedIn':False}

# from postgres import getUser, createUser


app = Flask(__name__)
app.secret_key = open('secret_key.txt', 'r').read()


@app.route('/')
def homepage():

    if(session['loggedIn'] == False):
        return render_template("splash.html")

    else:

        # TODO fetch all game data for this user, pass into view. react will process it.
        games = pgdb.getActiveGames(session['username'])

        return render_template("home.html", games = games)

    
@app.route('/games/<gameid>')
def game(gameid):
    gameid = "b9482237-8c8e-41c8-879e-4e3cb695cab0"
    game = pgdb.getGame(gameid)
    return str(game)



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

    # TODO check if opponent exists
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
    # print(initialLayout)
    # boardstate = dict(initialLayout)
    time_started = datetime.now() 

    pgdb.createGame(gameId, white_player, black_player, boardstate, completed, time_started)

    return redirect('/')

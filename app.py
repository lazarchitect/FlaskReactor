from flask import Flask, render_template, redirect, request
from pgdb import checkIfUserExists, checkLogin, createUser, createStat
from utils import generateId, generateHash

### flask sessions save cookies in browser, which is better but annoying for development. TODO switch this later.
# from flask import session
session = {'loggedIn':False}

# from postgres import getUser, createUser


app = Flask(__name__)
app.secret_key = open('secret_key.txt', 'r').read()


@app.route('/')
def homepage():
    print(session)
    loggedIn = session['loggedIn']
    if(loggedIn == False):
        return render_template("splash.html")

    else:
        return render_template("home.html")
    
@app.route('/games/<gameid>')
def game():
    # TODO fetch game with corresponding gameID from pgdb
    pass



@app.route('/login', methods=["POST"])
def login():
    username = request.form['username']
    password = request.form['password']
    password_hash = generateHash(password)
    correctLogin = checkLogin(username, password_hash)
    if(correctLogin): 
    
        #success
        session['loggedIn'] = True
        session['username'] = username
        return redirect('/')
    else:
        return "you dont exist..."


@app.route('/signup', methods=["POST"])
def signup():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    password_repeat = request.form['password_repeat']

    if(password != password_repeat):
        return ("Your passwords did not match.")

    password_hash = generateHash(password)

    userid = str(generateId())

    createUser(username, password_hash, email, userid)
    createStat(userid)

    session['loggedIn'] = True
    session['username'] = request.form['username']
    return redirect('/')

@app.route("/logout", methods=["POST"])
def logout():
    session['loggedIn'] = False
    del session['username']
    return redirect("/")


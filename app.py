from postgres import userExists, createUser
from flask import Flask, render_template, redirect, request

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
    return render_template("index.html", loggedIn=loggedIn)
    
@app.route('/login', methods=["POST"])
def login():
    username = request.form['username']
    # password = request.form['password']
    #TODO check for user in postgres database. if not found, dont allow login.
    if(userExists(username)): 
    
        #success
        session['loggedIn'] = True
        session['username'] = username
        return redirect('/')
    else:
        return "you dont exist..."


@app.route('/signup', methods=["POST"])
def signup():
    username = request.form['username']
    #TODO create user in postgres database
    createUser(username)
    session['loggedIn'] = True
    session['username'] = request.form['username']
    return redirect('/')

@app.route("/logout", methods=["POST"])
def logout():
    session['loggedIn'] = False
    del session['username']
    return redirect("/")
from flask import Flask, render_template, session, request

app = Flask(__name__)
app.secret_key = open('secret_key.txt', 'r').read()

@app.route('/')
def homepage():
    loggedIn = 'loggedIn' in session
    return render_template("index.html", loggedIn=loggedIn)
    
@app.route('/login', methods=["POST"])
def login():
    session['loggedIn'] = True
    session['username'] = request.form['username']
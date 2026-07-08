from flask import session

from src.backend.pgdb import getPgdb
from src.backend.utils import generateHash

VALID_GAME_TYPES = ["Ttt", "Chess", "Quad"]

class ValidationError(Exception):
	def __init__(self, message):
		self.message = message

def validateCreateGame(request):

	player_name = session['username']
	opponent_name = request.form['opponent'].strip()
	game_type = request.form['gameType']

	if game_type not in VALID_GAME_TYPES:
		raise ValidationError(f"unsupported game type ${game_type} provided in request. Valid types are: ${str(VALID_GAME_TYPES)}")

	if session.get('loggedIn') == False:
		raise ValidationError("not logged in?") # shouldn't happen

	if opponent_name == "":
		raise ValidationError("enter a name, doofbury.")

	if player_name == opponent_name:
		raise ValidationError("you can't vs yourself, bubso.")

	opponent = getPgdb().getUser(opponent_name)

	if opponent is None:
		raise ValidationError("We didn't find a user with that name. Check spelling and special characters.")


def validateSignup(request):

	username = request.form['username']
	password = request.form['password']
	password_repeat = request.form['password_repeat']

	if password != password_repeat:
		raise ValidationError("Your passwords did not match.")

	usernameTaken = getPgdb().getUser(username) is not None
	if usernameTaken:
		raise ValidationError("That username is taken! sorry fam")


def validateLogin(request):
	input_username = request.form['username']
	input_password = request.form['password']
	input_password_hash = generateHash(input_password)

	existingUser = getPgdb().getUser(input_username)

	if existingUser is None:
		raise ValidationError("User " + input_username + " does not exist.")

	correctPassword = input_password_hash == existingUser.password_hash
	if not correctPassword:
		raise ValidationError("Username or password incorrect. Please check your details and try again.")
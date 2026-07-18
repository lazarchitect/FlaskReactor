from flask import session

from src.backend.pgdb import getPgdb
from src.backend.utils import generateHash, isEmpty

VALID_GAME_TYPES = ["Ttt", "Chess", "Quad"]
VALID_SETTINGS = ['quad_color_pref', 'quad_color_backup', 'use_chat', 'chess_piece_set']
VALID_QUAD_COLORS = ["red", "blue", "green", "cyan", "pink", "teal", "purple", "yellow", "orange"]

class ValidationError(Exception):
	def __init__(self, message):
		self.message = message
		self.code = 401 if message == "UNAUTHORIZED" else 400

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

	username = getOrError(request.form, 'username')
	password = getOrError(request.form, 'password')
	password_repeat = getOrError(request.form, 'password_repeat')

	if password != password_repeat:
		raise ValidationError("Your passwords did not match.")

	usernameTaken = getPgdb().getUser(username) is not None
	if usernameTaken:
		raise ValidationError("That username is taken! sorry fam")


def validateLogin(request):
	input_username = getOrError(request.form, 'username')
	input_password = getOrError(request.form, 'password')
	input_password_hash = generateHash(input_password)

	existingUser = getPgdb().getUser(input_username)

	if existingUser is None:
		raise ValidationError(f"User {input_username} does not exist.")

	if input_password_hash != existingUser.password_hash:
		raise ValidationError("Username or password incorrect. Please check your details and try again.")

def validateUpdateSettings(body: dict):

	ws_token = getOrError(body, "ws_token")
	username = getOrError(body, "username")
	setting  = getOrError(body, "setting")

	user = getPgdb().getUser(username)
	if user.ws_token != ws_token:
		raise ValidationError("UNAUTHORIZED")

	if setting not in VALID_SETTINGS:
		raise ValidationError("Invalid setting")

	if "quad_color" in setting:
		value = getOrError(body, "value")
		if value not in VALID_QUAD_COLORS:
			raise ValidationError("Invalid color")

	value = body.get('value') # non-String
	if value is None:
		raise ValidationError(f"missing value in input")

def getOrError(obj: dict, key: str):
	value = obj.get(key)
	if isEmpty(value):
		raise ValidationError(f"missing {key} in input")
	return value


def validateConfirmPasswordReset(request: dict):

	token = request.get('token')
	username = request.get('username')
	password = request.get('password')
	repeated = request.get('password_repeat')

	user = getPgdb().getUser(username)

	if user is None:
		raise ValidationError("BAD REQUEST - invalid username passed in password reset confirmation.") # shouldn't happen for normal users

	if token != user.password_reset_token:
		raise ValidationError("BAD REQUEST - bad security token provided or multiple tries attempted.")

	if password != repeated:
		raise ValidationError("Provided passwords didn't match.") # shouldn't happen to normal users
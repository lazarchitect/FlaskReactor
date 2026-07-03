import json
from hashlib import sha256
from uuid import uuid4

from tornado.websocket import WebSocketClosedError

def generateId():
	return uuid4()

def generateHash(password):
	return sha256(password.encode('utf8')).hexdigest()

# checks for missing element or zero meaningful data
def isEmpty(string):
	return string is None or len(string.strip()) == 0

def notLoggedIn(session):
	return session.get('loggedIn') == False or session.get('loggedIn') is None

def updateAll(connections, message):
	for connectionDetails in connections:
		try:
			connectionDetails['conn'].write_message(json.dumps(message))
		except WebSocketClosedError:
			pass
			#print(str(connectionDetails['id']) + " was closed i guess? nvm...")

# user can be None if not logged in
def buildPreferences(user=None):
	if user is None:
		return {}
	return {
		"quadColorPref": user.quad_color_pref,
		"quadColorBackup": user.quad_color_backup,
		"useChat": user.use_chat
	}

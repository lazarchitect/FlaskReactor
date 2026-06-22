import json
from hashlib import sha256
from uuid import uuid4

from tornado.websocket import WebSocketClosedError

tttTriples = [(0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6)]

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


### TIC TAC TOE ###

def isWinner(a, b, c):
	return a == b and b == c and a != ''

def tttGameEnded(b):
	for triple in tttTriples:
		if isWinner(b[triple[0]], b[triple[1]], b[triple[2]]):
			return "Win"

	if '' not in b:
		return "Tie"

	return False

### Misc ###

def buildPreferences(session):
	return {
		"quadColorPref": session.get("quadColorPref"),
		"quadColorBackup": session.get("quadColorBackup")
	}

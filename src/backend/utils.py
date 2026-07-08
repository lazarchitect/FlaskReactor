import json
from hashlib import sha256
from types import SimpleNamespace
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

# user can be None if not logged in
def buildPreferences(user=None):
	if user is None:
		return {}
	return {
		"quad_color_pref": user.quad_color_pref,
		"quad_color_backup": user.quad_color_backup,
		"use_chat": user.use_chat
	}

def convertToObject(gameDict):
	"""Helpful for using dot notation instead of dict key access."""
	return SimpleNamespace(**gameDict)

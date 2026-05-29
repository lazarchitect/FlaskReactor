import json
from random import randint

from tornado.websocket import WebSocketHandler

from src.utils import generateId, isEmpty, updateAll

clientConnections = dict()

def deleteConnection(gameId, socketId):
	gameConnectionList = clientConnections[gameId]
	for x in gameConnectionList:
		if x['id'] == socketId:
			gameConnectionList.remove(x)
			return


def generateOrbSpawnLocation(boardstate):
	""" Randomly finds an open spot on the board and returns those coords."""
	while True:
		x = randint(0, 9)
		y = randint(0, 7)
		if (boardstate[y][x]["torus"] is not None):
			return (x, y)


def determineMaxOrbs(turn_number, boardstate):

	maxOrbs = 2 # default at start of game
	maxOrbs += int(turn_number / 15) # game length factor

	# TODO bother with this?
	# maxOrbs += emptyTileCount(boardstate) - 32 # sparser board factor

	return maxOrbs


class QuadHandler(WebSocketHandler):

	# this fn is required due to Flask/Tornado rejecting unspecified origins as Forbidden
	# unless we allow it explicitly
	def check_origin(self, origin):
		print(origin)
		return True

	def initialize(self, pgdb):
		self.pgdb = pgdb

	def open(self):
		self.socketId = "socket"+ str(generateId())[:8]
		print("quadSocket opened:", str(self.socketId))

	def on_message(self, message):

		fields = json.loads(message) # message structure comes in as JSON from frontend
		print(fields)

		request = fields['request']

		if request == "subscribe":
			self.handleSubscribe(fields)

		# after subscribing, we should be authenticating
		elif hasattr(self, "ws_token") == False or fields.get('ws_token') != self.ws_token:
			self.write_message({
				"command": "error",
				"message": "auth error! invalid ws_token for user"
			})
			return

		elif request == "update":
			self.handleUpdate(fields)

	def on_close(self):
		print("WebSocket closed")

	def handleUpdate(self, fields):

		gameId = fields['gameId']

		game = self.pgdb.getQuadradiusGame(gameId)

		# TODO modify game.boardstate based on src and dest. Destroy tori where appropriate. (Then that behavior should not exist in DropLogic.js.)
		# also in the future we will need to modify boardstate's tile elevation and status, orb locations, torus orbs and abilities

		newTurnNumber = game.turn_number + 1

		orbSpawnLocations = []

		newOrbCountdown = game.orb_countdown - 1
		if newOrbCountdown == 0:
			newOrbCountdown = randint(4, 8)
			maxOrbs = determineMaxOrbs(game.turn_number, game.boardstate)
			orbSpawnLocations = [generateOrbSpawnLocation(game.boardstate) for _ in range(randint(1, maxOrbs))]

		responseToClient = {
			"command": "updateBoard",
			"turn_number": newTurnNumber,
			"orb_counter": newOrbCountdown,
			"orb_spawn_locations": orbSpawnLocations,
			"newBoardstate": game.boardstate
			# what else?
		}

		updateAll(clientConnections[fields['gameId']], responseToClient)

		self.pgdb.updateQuadradiusGame(gameId)


	def handleSubscribe(self, fields: dict):

		if self.socketId is None:
			print('--------------------\nERROR!!! SOCKET ID NOT ASSIGNED\n---------------')

		connectionDetails = {
			"id": self.socketId,
			"conn": self.ws_connection
		}

		# gameId is given to the frontend by Flask in the payload
		try:
			gameId = fields['gameId']
		except KeyError:
			self.write_message({
				"command": "error",
				"message": "server did not receive a game ID from the client",
				"details": str(connectionDetails)
			})
			return

		#used for easy search during later deletion
		self.gameId = gameId

		if isEmpty(fields.get('ws_token')):
			self.write_message({
				"command": "info",
				"message": "server did not receive a ws_token from the client",
				"details": str(connectionDetails)
			})

		# authenticate user by checking if the provided ws_token matches what's in the DB
		user = self.pgdb.getUser(fields['username']) # possible improvement - let the users receive and pass back an encrypted string containing their ws_token
		if (fields['ws_token'] != user.ws_token):
			print("debug: this user is claiming to have a different WS token? malicious?")
			return #this guy's a phony!

		# used for authentication during updates
		self.ws_token = fields['ws_token']

		if gameId not in clientConnections:
			clientConnections[gameId] = [connectionDetails]
		else:
			clientConnections[gameId].append(connectionDetails)

		chats = self.pgdb.getChats(gameId)

		self.write_message({
			"command": "info",
			"contents": str(self.socketId) + " subscribed to gameId " + gameId
		})

		self.write_message({
			"command": "initialize",
			"chats": chats
		})
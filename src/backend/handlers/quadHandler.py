import json
import logging
import random
from datetime import datetime
from random import randint

from tornado.websocket import WebSocketHandler

from src.backend.pgdb import getPgdb
from src.backend.services.quad.Power import ALL_POWERS
from src.backend.utils import generateId, isEmpty, updateAll

# keys are gameIds. values are lists of connection details {socketId, connection} to inform of updates.
clientConnections = dict()

def getQuadSocketConnections():
	return clientConnections

def deleteConnection(gameId, socketId):
	gameConnectionList = clientConnections[gameId]
	for conn in gameConnectionList:
		if conn['id'] == socketId:
			gameConnectionList.remove(conn)
			return


def generateOrbSpawnLocation(boardstate):
	""" Randomly finds an open spot on the board and returns those coords."""
	while True:
		x = randint(0, 9)
		y = randint(0, 7)
		if "torus" not in boardstate[y][x]:
			return x, y


def determineMaxOrbs(turn_number, boardstate):

	maxOrbs = 2 # default at start of game
	maxOrbs += min(int(turn_number / 20), 6) # game length factor

	# possible upgrade - increase orb spawn chance when fewer tori are left
	# maxOrbs += emptyTileCount(boardstate) - 32 # sparser board factor

	return maxOrbs


def validMove(sourceCoords, targetCoords):
	""" Server side move validation, in case of tricksters.
	Manhattan distance, elevation +1 or less, target tile is empty or has enemy, and is not acid-melted.
	Also, TODO we need to check that the user sending this move is actually the owner of the sourceTile torus!"""
	return True


class QuadHandler(WebSocketHandler):

	# this fn is required due to Flask/Tornado rejecting unspecified origins as Forbidden
	# unless we allow it explicitly
	def check_origin(self, origin):
		return True

	def initialize(self):
		self.pgdb = getPgdb()

	def open(self):
		self.socketId = "socket"+ str(generateId())[:8]
		logging.info("quadSocket opened: " + self.socketId)

	def on_message(self, message):

		fields = json.loads(message) # message structure comes in as JSON from frontend

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
		if not hasattr(self, "gameId"):
			print("quadSocket was not subscribed? not sure why this would happen")
			return

		deleteConnection(self.gameId, self.socketId)
		logging.info("quadSocket closed: " + self.socketId)

	def handleUpdate(self, fields):

		gameId = fields['gameId']

		# performance issue to do a DB read every single move? maybe just have them send what we need?
		game = self.pgdb.getQuadradiusGame(gameId)

		# for posterity: there are multiple types of updates. Moves, power activations on tori, power effect outcomes.

		### MOVE LOGIC ###
		# modify game.boardstate based on src and dest. Destroy tori where appropriate.

		sourceCoords = fields['src']
		targetCoords = fields['dest']

		sourceRow, sourceCol = fields['src']['row'], fields['src']['col']
		targetRow, targetCol = fields['dest']['row'], fields['dest']['col']

		sourceTile = game.boardstate[sourceRow][sourceCol]
		targetTile = game.boardstate[targetRow][targetCol]

		if not validMove(sourceCoords, targetCoords):
			return

		# execute the move. copy torus over to target and then remove source one. any existing torus at target is wiped out.
		targetTile['torus'] = sourceTile['torus']
		del sourceTile['torus']

		newTurnNumber = game.turn_number + 1

		newOrbCountdown = game.orb_countdown - 1
		if newOrbCountdown == 0:
			newOrbCountdown = 8
			maxOrbs = determineMaxOrbs(game.turn_number, game.boardstate)
			orbSpawnLocations = [generateOrbSpawnLocation(game.boardstate) for _ in range(randint(1, maxOrbs))]
			for orbSpawn in orbSpawnLocations:
				game.boardstate[orbSpawn[1]][orbSpawn[0]]["orb"] = True

		powersList = {game.player1: game.player1_powers,game.player2: game.player2_powers}.get(fields['username'])
		print(powersList)

		# if target tile has an Orb, consume it
		if 'orb' in targetTile:
			del targetTile['orb']

			# get a new random power, assign it to the Torus's list of powers.
			# Powers info cannot be stored in the boardstate!
			# this should be sent to each player separately
			# powers are associated with a Torus, but on the UI, each player will see a list of all their powers.
			# Powers List is all clickable text, clicking it makes the Torus that has that power glow.
			# So how do we associate a Power with a Torus???? do we need Torus IDs?
			# I'm thinking some kind of layered data structure like: {torusId_1: {Power(name:refurb, rcr: radial, count:1), Power(name:acid, rcr: row, count:2) ... } ... }
			power = random.choice(ALL_POWERS)
			powersList[power] = powersList.get(power, 0) + 1
			self.write_message(json.dumps({
				"command": "updateLegend",
				"newLegendState": {"powersList": powersList, "turn_number": newTurnNumber, "orb_countdown": newOrbCountdown}
			}))

			targetTile.torus.powers
			# here is where we grant the Torus a power

		newActivePlayer = game.player1 if game.active_player == game.player2 else game.player2
		newInactivePlayer = game.player1 if game.active_player == game.player1 else game.player2

		messageToSubscribers = {
			"command": "update",
			"newLegendState": {"turn_number": newTurnNumber, "orb_countdown": newOrbCountdown, "powersList": {}},
			"newBoardstate": game.boardstate,
			"active_player": newActivePlayer,
			"inactive_player": newInactivePlayer
			# what else?
		}

		updateAll(clientConnections[fields['gameId']], messageToSubscribers)

		self.pgdb.updateQuadradiusGame(game.boardstate, newActivePlayer, datetime.now(), newTurnNumber, newOrbCountdown, game.player1_powers, game.player2_powers, gameId)


	def handleSubscribe(self, fields: dict):

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

		if isEmpty(fields.get('ws_token')):
			self.write_message({
				"command": "info",
				"message": "server did not receive a ws_token from the client",
				"details": str(connectionDetails)
			})

		else:
			# used for authentication during updates
			self.ws_token = fields['ws_token']

		#used for easy search during later deletion
		self.gameId = gameId

		if gameId not in clientConnections:
			clientConnections[gameId] = [connectionDetails]
		else:
			clientConnections[gameId].append(connectionDetails)

		game = self.pgdb.getQuadradiusGame(gameId)

		self.write_message({
			"command": "initialize",
			"active_player": game.active_player,
			"inactive_player": game.player1 if game.active_player == game.player2 else game.player2,
			"contents": str(self.socketId) + " subscribed to gameId " + gameId
		})
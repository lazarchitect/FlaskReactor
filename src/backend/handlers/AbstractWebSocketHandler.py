import json
import logging

from tornado.websocket import WebSocketHandler, WebSocketClosedError

from src.backend.pgdb import getPgdb
from src.backend.utils import generateId


class AbstractWebSocketHandler(WebSocketHandler):
	clientConnections = dict()  # each subclass overwrites this

	def initialize(self):
		self.pgdb = getPgdb()
		self.gameId = None # created later, during subscribe
		self.handlerType = None # initialized by subclass

	# this fn is required due to Flask/Tornado rejecting unspecified origins as Forbidden
	# unless we allow it explicitly
	def check_origin(self, origin):
		return True

	def open(self):
		self.socketId = "socket"+ str(generateId())[:8]
		logging.info(f"{self.handlerType}Socket opened: " + self.socketId)

	def on_close(self):
		if not hasattr(self, "gameId"):
			print(f"{self.handlerType}Socket was not subscribed? not sure why this would happen")
			return
		self.deleteConnection(self.gameId, self.socketId)
		logging.info(f"{self.handlerType}Socket closed: " + self.socketId)

	def deleteConnection(self, gameId, socketId):
		gameConnectionList = self.clientConnections[gameId]
		for x in gameConnectionList:
			if x['id'] == socketId:
				gameConnectionList.remove(x)
				if len(gameConnectionList) == 0:
					del self.clientConnections[gameId] # possible unexpected behavior due to async subscribe/update during this
				return

	def updateAll(self, gameId, message):
		gameConnections = self.clientConnections[gameId]
		for connectionDetails in gameConnections:
			try:
				connectionDetails['conn'].write_message(json.dumps(message))
			except WebSocketClosedError:
				pass
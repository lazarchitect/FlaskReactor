from models.Game import Game
from models.User import User
from models.Stats import Stats
from models.Message import Message

class FakePgdb:

	def getUser(self, username):
		return ('JSmith11', 'john.smith@aol.com', '38298dd7-e30d-42d7-8c3a-94483dfc4af3', 'shtjteykyjthehu6w57')

	def checkLogin(self, username, password_hash):
		return True

	def createUser(self, username, password_hash, email, userid):
		pass

	def createStat(self, userId):
		pass

	def createGame(self, g):
		pass

	def getGame(self, gameId):
		return Game.manualCreate("player1", "player2")

	def getActiveGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'player1', 'player2', {}, False, None, None, None, 'player1')]

	def updateBoardstate(self, new_boardstate, update_time, gameid):
		pass

	def endGame(self, end_time, gameid):
		pass

	####### HELPER METHODS #########

	def userExists(self, username):
		return True
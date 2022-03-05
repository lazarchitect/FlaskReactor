from models.ChessGame import ChessGame
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

	def getChessGame(self, gameId):
		return ChessGame.manualCreate("Eddie", "Eddie2")

	def getActiveChessGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'Eddie', 'Eddie2', {}, False, None, None, None, 'Eddie')]

	def getTttGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'Eddie', 'Eddie2', {}, False, None, None, None, 'Eddie')]

	def getTttGame(self, username):
		return ('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'Eddie', 'Eddie2', {}, False, None, None, None, 'Eddie')

	def updateBoardstate(self, new_boardstate, update_time, gameid):
		pass

	def endGame(self, end_time, gameid):
		pass

	####### HELPER METHODS #########

	def userExists(self, username):
		return True
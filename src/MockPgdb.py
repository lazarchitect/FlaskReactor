from src.models.ChessGame import ChessGame
from src.models.User import User
from src.models.Stats import Stats
from src.models.Message import Message

class MockPgdb:

	def getUser(self, username):
		return ('MockSmith11', 'mock_email@aol.com', 'mock_38298dd7-e30d-42d7-8c3a-94483dfc4af3', 'mock_pw_shtjteykyjthehu6w57', 'mock_wstoken')

	def checkLogin(self, username, password_hash):
		return True

	def createUser(self, username, password_hash, email, userid):
		pass

	def createStat(self, userId):
		pass

	def createGame(self, g):
		pass

	def createChessGame(self, g):
		pass

	def getChessGame(self, gameId):
		return ChessGame.dbLoad(['FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', [], False, None, None, None, 'MockUser1', None,None,None,None,None,None,None,None,None, -1])

	def getActiveChessGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')]

	def getChessGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')]

	def getTttGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')]

	def getTttGame(self, username):
		return ('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')

	def updateBoardstate(self, new_boardstate, update_time, gameid):
		pass

	def endGame(self, end_time, gameid):
		pass

	def getMessages(self, gameId):
		return [(1, "MockUser1", "hello")]

	####### HELPER METHODS #########

	def userExists(self, username):
		return True
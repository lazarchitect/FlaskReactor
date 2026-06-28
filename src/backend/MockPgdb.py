import json

from src.backend.models.ChessGame import ChessGame
from src.backend.models.QuadradiusGame import QuadradiusGame
from src.backend.models.User import User

chessJson = json.loads(open('resources/initialChessLayout.json', 'r').read())
quadJson =json.loads(open('resources/initialQuadLayout.json', 'r').read())

# ALERT this class is just constantly out of date, avoid using at all if possible
class MockPgdb:

	def getUser(self, username):
		return User('MockSmith11', 'mock_email@aol.com', 'mock_38298dd7-e30d-42d7-8c3a-94483dfc4af3', 'mock_pw_shtjteykyjthehu6w57', 'mock_ws_token')

	def createUser(self, username, password_hash, email, userid):
		pass

	def createStat(self, userId):
		pass

	def createGame(self, g):
		pass

	def createChessGame(self, g):
		pass

	def getChessGame(self, gameId) -> ChessGame | None:
		return ChessGame.dbLoad(['FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', chessJson, False, None, None, None, 'MockUser1', None,None,None,None,None,None,None,None,None, -1])
		
	def getChessGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', chessJson, False, None, None, None, 'MockUser1')]

	def getTttGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')]

	def getTttGame(self, username):
		return ('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')

	def getAllGames(self, username):
		return [[('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', {}, False, None, None, None, 'MockUser1')],[],[]]

	def updateBoardstate(self, new_boardstate, update_time, gameId):
		pass

	def endGame(self, end_time, gameId):
		pass

	def getMessages(self, gameId):
		return [(1, "MockUser1", "hello")]

	def getQuadradiusGame(self, gameId):
		return QuadradiusGame("jim", "jon", "red", "blue", "jim", False)
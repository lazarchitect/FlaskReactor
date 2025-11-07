from src.models.ChessGame import ChessGame
from src.models.User import User
from src.models.Stats import Stats
from src.models.Message import Message

chessJson = [[{"piece":{"row":0,"col":0,"type":"Rook","color":"Black","id":"br1"}},{"piece":{"row":0,"col":1,"type":"Knight","color":"Black","id":"bn1"}},{"piece":{"row":0,"col":2,"type":"Bishop","color":"Black","id":"bb1"}},{"piece":{"row":0,"col":3,"type":"Queen","color":"Black","id":"bq"}},{"piece":{"row":0,"col":4,"type":"King","color":"Black","id":"bk"}},{"piece":{"row":0,"col":5,"type":"Bishop","color":"Black","id":"bb2"}},{"piece":{"row":0,"col":6,"type":"Knight","color":"Black","id":"bn2"}},{"piece":{"row":0,"col":7,"type":"Rook","color":"Black","id":"br2"}}],[{"piece":{"row":1,"col":0,"type":"Pawn","color":"Black","id":"bp1"}},{"piece":{"row":1,"col":1,"type":"Pawn","color":"Black","id":"bp2"}},{"piece":{"row":1,"col":2,"type":"Pawn","color":"Black","id":"bp3"}},{"piece":{"row":1,"col":3,"type":"Pawn","color":"Black","id":"bp4"}},{"piece":{"row":1,"col":4,"type":"Pawn","color":"Black","id":"bp5"}},{"piece":{"row":1,"col":5,"type":"Pawn","color":"Black","id":"bp6"}},{"piece":{"row":1,"col":6,"type":"Pawn","color":"Black","id":"bp7"}},{"piece":{"row":1,"col":7,"type":"Pawn","color":"Black","id":"bp8"}}],[{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{}],[{"piece":{"row":6,"col":0,"type":"Pawn","color":"White","id":"wp1"}},{"piece":{"row":6,"col":1,"type":"Pawn","color":"White","id":"wp2"}},{"piece":{"row":6,"col":2,"type":"Pawn","color":"White","id":"wp3"}},{"piece":{"row":6,"col":3,"type":"Pawn","color":"White","id":"wp4"}},{"piece":{"row":6,"col":4,"type":"Pawn","color":"White","id":"wp5"}},{"piece":{"row":6,"col":5,"type":"Pawn","color":"White","id":"wp6"}},{"piece":{"row":6,"col":6,"type":"Pawn","color":"White","id":"wp7"}},{"piece":{"row":6,"col":7,"type":"Pawn","color":"White","id":"wp8"}}],[{"piece":{"row":7,"col":0,"type":"Rook","color":"White","id":"wr1"}},{"piece":{"row":7,"col":1,"type":"Knight","color":"White","id":"wn1"}},{"piece":{"row":7,"col":2,"type":"Bishop","color":"White","id":"wb1"}},{"piece":{"row":7,"col":3,"type":"Queen","color":"White","id":"wq"}},{"piece":{"row":7,"col":4,"type":"King","color":"White","id":"wk"}},{"piece":{"row":7,"col":5,"type":"Bishop","color":"White","id":"wb2"}},{"piece":{"row":7,"col":6,"type":"Knight","color":"White","id":"wn2"}},{"piece":{"row":7,"col":7,"type":"Rook","color":"White","id":"wr2"}}]]

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
		return ChessGame.dbLoad(['FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', chessJson, False, None, None, None, 'MockUser1', None,None,None,None,None,None,None,None,None, -1])
		
	def getChessGames(self, username):
		return [('FAKE8dd7-e30d-42d7-8c3a-94483dfc4af3', 'MockUser1', 'MockUser2', chessJson, False, None, None, None, 'MockUser1')]

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

from tornado.websocket import WebSocketHandler
from pgdb import Pgdb
import utils
import json

class statHandler(WebSocketHandler):

	def initialize(self, db_env):
		self.pgdb = Pgdb(db_env)

	def open(self):
		self.socketId = "socket"+ str(utils.generateId())[:8]
		print("statSocket opened:", str(self.socketId))

	def on_message(self, message):
		fields = json.loads(message)
		request = fields['request']
		gameType = fields['gameType']

		if request == "updateStat":

			if gameType == "ttt":
				self.updateTttStat(fields)

	def on_close(self):
		pass

	def updateTttStat(self, fields):
		gameId = fields['gameId']
		userId = fields['userId']
		username = fields['username']

		stat = self.pgdb.getStat(userId)

		tttGame = self.pgdb.getTttGame(gameId)
		winner = tttGame.winner

		ttt_games_played = stat['ttt_games_played'] + 1
		ttt_wins = stat['ttt_wins'] + (1 if winner == username else 0)
		ttt_win_percent = ttt_wins/ttt_games_played
		ttt_played_x = stat['ttt_played_x'] + (1 if username==tttGame.x_player else 0)
		ttt_played_o = stat['ttt_played_o'] + (1 if username==tttGame.o_player else 0)
		ttt_won_x = stat['ttt_won_x'] + (1 if winner == username and username==tttGame.x_player else 0)
		ttt_won_o = stat['ttt_won_o'] + (1 if winner == username and username==tttGame.o_player else 0)

		self.pgdb.updateTttStat(
			ttt_games_played,
			ttt_wins,
			ttt_win_percent,
			ttt_played_x,
			ttt_played_o,
			ttt_won_x,
			ttt_won_o,
			userId)
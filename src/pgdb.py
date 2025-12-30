"""provides a set of tools for interfacing with FlaskReactor's custom Postgres Database (PGDB) instance,
containing game data, users, and more."""

from psycopg import connect, InterfaceError, OperationalError
from psycopg.errors import InFailedSqlTransaction
from psycopg.rows import dict_row
from psycopg.types.json import Json

from src.MockPgdb import MockPgdb
from src.models.ChessGame import ChessGame
from src.models.QuadradiusGame import QuadradiusGame
from src.models.TttGame import TttGame
from src.models.User import User

schema = "flaskreactor"
usersTable = schema + ".users"
statsTable = schema + ".stats"
chatsTable = schema + ".chats"
chessGamesTable = schema + ".chess_games"
tttGamesTable = schema + ".tictactoe_games"
quadGamesTable = schema + ".quadradius_games"

sql = {

	#Users
	"createUser": f"INSERT INTO {usersTable} (name, password_hash, email, id, ws_token, quad_color_pref, quad_color_backup) VALUES (%s, %s, %s, %s, %s, %s, %s)",
	"getUser": f"SELECT * FROM {usersTable} WHERE lower(name)=lower(%s)",
	"updateSetting": f"UPDATE {usersTable} SET _SETTING_=%s WHERE name=%s",

	# Quadradius
	"createQuadradiusGame": f"INSERT INTO {quadGamesTable}  (id, player1, player2, player1_color, player2_color, boardstate, active_player, completed, time_started, last_move, time_ended, winner) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
	"getQuadradiusGames": f"SELECT * FROM {quadGamesTable} WHERE player1 = %s OR player2 = %s ORDER BY last_move DESC",
	"getQuadradiusGame": f"SELECT * FROM {quadGamesTable} WHERE id = %s",
	"getPreferredTorusColors": f"SELECT quad_color_pref, quad_color_backup FROM {usersTable} where name=%s",

	# Chess
	"createChessGame": f"INSERT INTO {chessGamesTable} (id, white_player, black_player, boardstate, completed, time_started, last_move, time_ended, player_turn, winner) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
	"getCompletedChessGames": f"SELECT * FROM {chessGamesTable} where completed=true AND (white_player=%s OR black_player=%s)",
	"getChessGames": f"SELECT * FROM {chessGamesTable} where (white_player=%s OR black_player=%s) ORDER BY last_move DESC",
	"getChessGame": f"SELECT * FROM {chessGamesTable} WHERE id=%s",
	"updateChessGame": f"UPDATE {chessGamesTable} SET boardstate=%s, last_move=%s, player_turn=%s, notation=%s, blackKingMoved=%s, whiteKingMoved=%s, bqr_moved=%s, bkr_moved=%s, wqr_moved=%s, wkr_moved=%s, pawn_leapt=%s, pawn_leap_col=%s WHERE id=%s",
	"endChessGame": f"UPDATE {chessGamesTable} SET completed=true, time_ended=%s, winner=%s WHERE id=%s",

	# Tic-Tac-Toe
	"createTttGame": f"INSERT INTO {tttGamesTable} (id, x_player, o_player, completed, time_started, last_move, time_ended, player_turn, winner, boardstate) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
	"getTTTGames": f"SELECT * FROM {tttGamesTable} where (x_player=%s OR o_player=%s) ORDER BY last_move DESC",
	"getTttGame": f"SELECT * FROM {tttGamesTable} where id=%s",
	"updateTttGame": f"UPDATE {tttGamesTable} SET boardstate=%s, last_move=%s, player_turn=%s WHERE id=%s",
	"endTttGame": f"UPDATE {tttGamesTable} SET completed=true, time_ended=%s, player_turn='', winner=%s WHERE id=%s",

	# Stats
	"createStat": f"INSERT INTO {statsTable} (userid) VALUES (%s)",
	"getStat": f"SELECT * FROM {statsTable} WHERE userid=%s",
	"updateTttStat": f"UPDATE {statsTable} SET ttt_games_played=%s, ttt_wins=%s, ttt_win_percent=%s, ttt_played_x=%s, ttt_played_o=%s, ttt_won_x=%s, ttt_won_o=%s WHERE userid=%s",

	# Chats
	"createChat": f"INSERT INTO {chatsTable} (gameid, content, username) VALUES (%s, %s, %s)",
	"getChats": f"SELECT index, username, content FROM {chatsTable} WHERE gameid=%s"

}

class Pgdb:
	"""interacts with a Postgres database of Flaskreactor users and games, for CRUD operations on records."""

	_instance = None

	# overriding new in order to use a Singleton approach, no need to reinstantiate for every Handler that comes up
	# and also to allow for MockPgdb to be used without impacting code in any other file
	def __new__(cls, postgres_config):

		if not cls._instance: # first time instantiating

			env = postgres_config['env']
			if env not in ['local', 'remote', 'none']:
				print('Invalid postgres env value in app_config:', env)
				exit()

			cls.db_env = env
			print("connecting to environment:", cls.db_env)

			if cls.db_env == "none": # dev only!
				print('setting DB client to MockPgdb')
				cls._instance = MockPgdb()
			else:
				cls._instance = super().__new__(cls)

		return cls._instance

	def __init__(self, postgres_config):

		self.config = postgres_config

		try:
			self.conn = connect(
				host     = self.config['local_ip' if self.db_env=='local' else 'remote_ip'],
				dbname   = self.config['database'],
				user     = self.config['user'],
				password = self.config['password']
			)

			self.cursor = self.conn.cursor(row_factory=dict_row)

		except OperationalError as oe:
			print(oe)
			exit()

		except KeyError as ke:
			print("app_config missing a key: postgres ->", ke.args[0])
			exit()

	def __execute(self, query, values):
		"""
		executes some generic query on the DB, which might read, update, create, or destroy records.
		this private function should only be called from other meaningful Pgdb methods,
		which formulate specific query arguments.
		"""

		try:
			self.cursor.execute(query, values)
		except (InterfaceError, OperationalError):
			#Connection was closed. reset conn and cursor. (this happens due to idle timeouts.)
			self.conn = connect(
				host     = self.config['remote_ip' if self.db_env=='remote' else 'local_ip'],
				database = self.config['database'],
				user     = self.config['user'],
				password = self.config['password']
			)
			self.cursor = self.conn.cursor(row_factory=dict_row)
			self.__execute(query, values)

		except InFailedSqlTransaction: # type: ignore
			self.conn.rollback()


	###### DB QUERY METHODS ######

	### General

	def getUser(self, username: str):
		query = sql['getUser']
		values = [username]
		self.__execute(query, values)
		userDict = self.cursor.fetchone()
		if (userDict is None):
			return None
		return User.dbLoad(userDict)

	def createUser(self, user):
		query = sql['createUser']
		values = user.toTuple()
		self.__execute(query, values)
		self.conn.commit()


	### Quadradius

	def createQuadradiusGame(self, g):
		query = sql['createQuadradiusGame']
		values = g.toTuple()
		self.__execute(query, values)
		self.conn.commit()

	def getQuadradiusGames(self, username):
		query = sql['getQuadradiusGames']
		values = (username, username)
		self.__execute(query, values)
		return self.cursor.fetchall()

	def getQuadradiusGame(self, gameId):
		query = sql['getQuadradiusGame']
		values = (gameId,)
		self.__execute(query, values)
		gameDict = self.cursor.fetchone()
		if gameDict is None:
			print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return QuadradiusGame.dbLoad(gameDict)

	def getPreferredTorusColors(self, user):
		query = sql['getPreferredTorusColors']
		values = (user,)
		self.__execute(query, values)
		return self.cursor.fetchone()

	### Chess

	def createChessGame(self, g):
		query = sql['createChessGame']
		values = g.toTuple()
		self.__execute(query, values)
		self.conn.commit()

	def getChessGame(self, gameId):
		query = sql['getChessGame']
		values = [gameId]
		self.__execute(query, values)
		record = self.cursor.fetchone()
		if record is None:
			print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return ChessGame.dbLoad(record)

	def getChessGames(self, username):
		query = sql['getChessGames']
		values = [username, username]
		self.__execute(query, values)
		return self.cursor.fetchall()

	def updateChessGame(self, new_boardstate, update_time, active_player, newNotation, blackKingMoved, whiteKingMoved, bqrMoved, bkrMoved, wqrMoved, wkrMoved, pawnLeapt, pawnLeapCol, gameId):
		query = sql['updateChessGame']
		values = [Json(new_boardstate), update_time, active_player, newNotation, blackKingMoved, whiteKingMoved, bqrMoved, bkrMoved, wqrMoved, wkrMoved, pawnLeapt, pawnLeapCol, gameId]
		self.__execute(query, values)
		self.conn.commit()

	def endChessGame(self, end_time, winner, gameId):
		query = sql['endChessGame']
		values = [end_time, winner, gameId]
		self.__execute(query, values)
		self.conn.commit()

	### Tic-Tac-Toe

	def getTttGame(self, gameId):
		query = sql['getTttGame']
		values = [gameId]
		self.__execute(query, values)
		record = self.cursor.fetchone()
		if(record is None):
			print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return TttGame.dbLoad(record)

	def getTttGames(self, username):
		query = sql["getTTTGames"]
		values = [username, username]
		self.__execute(query, values)
		return self.cursor.fetchall()

	def createTttGame(self, g):
		query = sql['createTttGame']
		values = g.toTuple()
		self.__execute(query, values)
		self.conn.commit()

	def updateTttGame(self, boardstate, last_updated, otherPlayer, gameId):
		query = sql['updateTttGame']
		values = [boardstate, last_updated, otherPlayer, gameId]
		self.__execute(query, values)
		self.conn.commit()

	def endTttGame(self, time_ended, winner, gameId):
		query = sql['endTttGame']
		values = [time_ended, winner, gameId]
		self.__execute(query, values)
		self.conn.commit()

	### Stats

	def createStat(self, userId):
		query = sql['createStat']
		values = [str(userId)]
		self.__execute(query, values)
		self.conn.commit()

	def getStat(self, userId):
		query = sql["getStat"]
		values = [userId]
		self.__execute(query, values)
		return self.cursor.fetchone()

	def updateTttStat(self, ttt_games_played, ttt_wins, ttt_win_percent, ttt_played_x, ttt_played_o, ttt_won_x, ttt_won_o, user_id):
		query = sql['updateTttStat']
		values = [ttt_games_played, ttt_wins, ttt_win_percent, ttt_played_x, ttt_played_o, ttt_won_x, ttt_won_o, user_id]
		self.__execute(query, values)
		self.conn.commit()

	### Chat

	def createChat(self, gameId, content, username):
		query = sql['createChat']
		values = [gameId, content, username]
		self.__execute(query, values)
		self.conn.commit()

	def getChats(self, gameId):
		query = sql['getChats']
		values = [gameId]
		self.__execute(query, values)
		return self.cursor.fetchall()


	### Settings

	def updateSetting(self, settingName, value, username):
		query = sql['updateSetting'].replace("_SETTING_", settingName) # can try this with %s instead of .replace?
		values = [value, username]
		self.__execute(query, values)
		return self.conn.commit()

	####### HELPER METHODS #########

	def getAllGames(self, username):
		"""Retrieves all games of all types where the given user is a player."""
		return [ # option to use JOIN instead of three queries if performance issues arise.
			self.getChessGames(username),
			self.getTttGames(username),
			self.getQuadradiusGames(username)
		]
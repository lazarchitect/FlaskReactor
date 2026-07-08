"""provides a set of tools for interfacing with FlaskReactor's custom Postgres Database (PGDB) instance,
containing game data, users, and more."""

from psycopg import connect, InterfaceError, OperationalError
from psycopg.errors import InFailedSqlTransaction
from psycopg.rows import dict_row
from psycopg.types.json import Json

from src.backend.dbUtils import convertToObject

schema = "flaskreactor"
usersTable = schema + ".users"
statsTable = schema + ".stats"
chatsTable = schema + ".chats"
chessGamesTable = schema + ".chess_games"
tttGamesTable = schema + ".tictactoe_games"
quadGamesTable = schema + ".quadradius_games"

sql = {

	#Users
	"createUser": f"INSERT INTO {usersTable} (name, password_hash, email, id, ws_token) VALUES (%(name)s, %(password_hash)s, %(email)s, %(id)s, %(ws_token)s)",
	"getUser": f"SELECT * FROM {usersTable} WHERE lower(name)=lower(%s)",
	"updateSetting": f"UPDATE {usersTable} SET _SETTING_=%s WHERE name=%s",

	# Quadradius
	"createQuadradiusGame": f"INSERT INTO {quadGamesTable}  (id, player1, player2, player1_color, player2_color, boardstate, active_player, orb_countdown) values (%(id)s, %(player1)s, %(player2)s, %(player1_color)s, %(player2_color)s, %(boardstate)s, %(active_player)s, %(orb_countdown)s)",
	"getQuadradiusGames": f"SELECT * FROM {quadGamesTable} WHERE player1 = %s OR player2 = %s ORDER BY last_move DESC",
	"getQuadradiusGame": f"SELECT * FROM {quadGamesTable} WHERE id = %s",
	"getPreferredTorusColors": f"SELECT quad_color_pref, quad_color_backup FROM {usersTable} where name=%s",
	"updateQuadradiusGame": f"UPDATE {quadGamesTable} SET boardstate=%s, active_player=%s, last_move=%s, turn_number=%s, orb_countdown=%s, player1_powers=%s, player2_powers=%s where id=%s",

	# Chess
	"createChessGame": f"INSERT INTO {chessGamesTable} (id, white_player, black_player, active_player, boardstate) VALUES (%(id)s, %(white_player)s, %(black_player)s, %(white_player)s, %(boardstate)s)",
	"getCompletedChessGames": f"SELECT * FROM {chessGamesTable} where completed=true AND (white_player=%s OR black_player=%s)",
	"getChessGames": f"SELECT * FROM {chessGamesTable} where (white_player=%s OR black_player=%s) ORDER BY last_move DESC",
	"getChessGame": f"SELECT * FROM {chessGamesTable} WHERE id=%s",
	"updateChessGame": f"UPDATE {chessGamesTable} SET boardstate=%s, last_move=%s, active_player=%s, notation=%s, blackKingMoved=%s, whiteKingMoved=%s, bqr_moved=%s, bkr_moved=%s, wqr_moved=%s, wkr_moved=%s, pawn_leapt=%s, pawn_leap_col=%s WHERE id=%s",
	"endChessGame": f"UPDATE {chessGamesTable} SET completed=true, boardstate=%s, time_ended=%s, winner=%s WHERE id=%s",

	# Tic-Tac-Toe
	"createTttGame": f"INSERT INTO {tttGamesTable} (id, x_player, o_player, active_player, boardstate) VALUES (%(id)s, %(x_player)s, %(o_player)s, %(active_player)s, %(boardstate)s)",
	"getTTTGames": f"SELECT * FROM {tttGamesTable} where (x_player=%s OR o_player=%s) ORDER BY last_move DESC",
	"getTttGame": f"SELECT * FROM {tttGamesTable} where id=%s",
	"updateTttGame": f"UPDATE {tttGamesTable} SET boardstate=%s, last_move=%s, active_player=%s WHERE id=%s",
	"endTttGame": f"UPDATE {tttGamesTable} SET completed=true, time_ended=%s, active_player='', winner=%s WHERE id=%s",

	# Stats
	"createStat": f"INSERT INTO {statsTable} (userid) VALUES (%s)",
	"getStat": f"SELECT * FROM {statsTable} WHERE userid=%s",
	"updateTttStat": f"UPDATE {statsTable} SET ttt_games_played=%s, ttt_wins=%s, ttt_win_percent=%s, ttt_played_x=%s, ttt_played_o=%s, ttt_won_x=%s, ttt_won_o=%s WHERE userid=%s",

	# Chats
	"createChat": f"INSERT INTO {chatsTable} (gameid, content, username) VALUES (%s, %s, %s)",
	"getChats": f"SELECT index, username, content FROM {chatsTable} WHERE gameid=%s"

}

pgdb_instance = None

def getPgdb():
	return pgdb_instance

class Pgdb:
	"""interacts with a Postgres database of Flaskreactor users and games, for CRUD operations on records."""

	db_env = None
	_instance = None

	# overriding new in order to use a Singleton approach, no need to reinstantiate for every Handler that comes up
	def __new__(cls, postgres_config):

		if not cls._instance: # first time instantiating

			env = postgres_config['env']
			if env not in ['local', 'remote']:
				print('Invalid postgres env value in app_config:', env)
				exit()

			cls.db_env = env
			print("connecting to environment:", cls.db_env)

			cls._instance = super().__new__(cls)
			global pgdb_instance
			pgdb_instance = cls._instance

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
		Executes some generic query on the DB, which might read, update, create, or destroy records.
		This private function should only be called from other meaningful Pgdb methods,
		which formulate specific query arguments.
		"""

		try:
			self.cursor.execute(query, values)
		except (InterfaceError, OperationalError):
			#Connection was closed. reset conn and cursor. (this happens due to idle timeouts.)
			self.conn = connect(
				host     = self.config['local_ip' if self.db_env=='local' else 'remote_ip'],
				dbname   = self.config['database'],
				user     = self.config['user'],
				password = self.config['password']
			)
			self.cursor = self.conn.cursor(row_factory=dict_row)
			self.__execute(query, values)

		except InFailedSqlTransaction: # type: ignore
			self.conn.rollback()


	###### DB QUERY METHODS ######

	### General

	def createUser(self, userDict):
		query = sql['createUser']
		self.__execute(query, userDict)
		self.conn.commit()

	def getUser(self, username):
		query = sql['getUser']
		values = [username]
		self.__execute(query, values)
		userDict = self.cursor.fetchone()
		if userDict is None:
			return None
		return convertToObject(userDict)

	### Quadradius

	def createQuadradiusGame(self, gameDict):
		query = sql['createQuadradiusGame']
		self.__execute(query, gameDict)
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
			print("DATABASE READ ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return convertToObject(gameDict)

	def getPreferredTorusColors(self, user):
		query = sql['getPreferredTorusColors']
		values = (user,)
		self.__execute(query, values)
		return self.cursor.fetchone()

	def updateQuadradiusGame(self, boardstate, active_player, last_move, turn_number, orb_countdown, player1_powers, player2_powers, gameId):
		query = sql['updateQuadradiusGame']
		values = (Json(boardstate), active_player, last_move, turn_number, orb_countdown, Json(player1_powers), Json(player2_powers), gameId)
		self.__execute(query, values)
		self.conn.commit()

	### Chess

	def createChessGame(self, gameDict):
		query = sql['createChessGame']
		self.__execute(query, gameDict)
		self.conn.commit()

	def getChessGame(self, gameId):
		query = sql['getChessGame']
		values = [gameId]
		self.__execute(query, values)
		record = self.cursor.fetchone()
		if record is None:
			print("DATABASE READ ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return convertToObject(record)

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

	def endChessGame(self, boardstate, end_time, winner, gameId):
		query = sql['endChessGame']
		values = [Json(boardstate), end_time, winner, gameId]
		self.__execute(query, values)
		self.conn.commit()

	### Tic-Tac-Toe

	def createTttGame(self, gameDict):
		query = sql['createTttGame']
		# makeInsertSafe(gameDict)
		self.__execute(query, gameDict)
		self.conn.commit()

	def getTttGame(self, gameId):
		query = sql['getTttGame']
		values = [gameId]
		self.__execute(query, values)
		record = self.cursor.fetchone()
		if record is None:
			print("DATABASE READ ERROR: NO GAME FOUND WITH ID " + gameId)
			return None
		return convertToObject(record)

	def getTttGames(self, username):
		query = sql["getTTTGames"]
		values = [username, username]
		self.__execute(query, values)
		return self.cursor.fetchall()

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
		# note - game IDs are inserted here but can originate from any game table, meaning uniqueness is not enforced.
		# For now, I suspect our use of UUIDs will give us some safety.
		# But, we can enforce uniqueness by storing a game type column, then using that as a filter during SELECT.
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
		self.conn.commit()

	####### HELPER METHODS #########

	def getAllGames(self, username):
		"""Retrieves all games of all types where the given user is a player."""
		return [ # option to use a single query with JOIN instead of three queries if performance issues arise.
			self.getChessGames(username),
			self.getTttGames(username),
			self.getQuadradiusGames(username)
		]
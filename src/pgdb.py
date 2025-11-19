"""provides a set of tools for interfacing with FlaskReactor's custom PostGres DataBase (PGDB) instance, 
containing game data, users, and more."""

import os
from json import loads
from psycopg2 import connect, InterfaceError, OperationalError
from psycopg2.extras import DictCursor, Json
from psycopg2.errors import InFailedSqlTransaction

from src.models.ChessGame import ChessGame
from src.models.TttGame import TttGame
from src.models.QuadradiusGame import QuadradiusGame
from src.MockPgdb import MockPgdb

relation = "flaskreactor"

sql = {

        #General
        "createUser": "INSERT INTO " + relation + ".users (name, password_hash, email, id, ws_token, quad_color_pref, quad_color_backup) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        "createStat": "INSERT INTO " + relation + ".stats (userid) VALUES (%s)",
        "getUser": "SELECT * FROM " + relation + ".users WHERE name=%s",
        "checkLogin": "SELECT * FROM " + relation + ".users WHERE name=%s AND password_hash=%s",

        # Quadradius
        "createQuadradiusGame": "INSERT INTO " + relation + ".quadradius_games (id, player1, player2, player1_color, player2_color, boardstate, completed) values (%s, %s, %s, %s, %s, %s, %s)",
        "getQuadradiusGames": "SELECT * FROM " + relation + ".quadradius_games WHERE player1 = %s OR player2 = %s",
        "getQuadradiusGame": "SELECT * FROM " + relation + ".quadradius_games WHERE id = %s",
        "getPreferredColors": "SELECT quad_color_pref, quad_color_backup FROM " + relation + ".users where name=%s",

        # Chess
        "getCompletedChessGames": "SELECT * FROM " + relation + ".chess_games where completed=true AND (white_player=%s OR black_player=%s)",
        "getChessGames": "SELECT * FROM " + relation + ".chess_games where (white_player=%s OR black_player=%s) ORDER BY last_move DESC",  
        "getChessGame": "SELECT * FROM " + relation + ".chess_games WHERE id=%s",
        "createChessGame": "INSERT INTO " + relation + ".chess_games (id, white_player, black_player, boardstate, completed, time_started, last_move, time_ended, player_turn, winner) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "updateChessGame": "UPDATE " + relation + ".chess_games SET boardstate=%s, last_move=%s, player_turn=%s, notation=%s, blackKingMoved=%s, whiteKingMoved=%s, bqr_moved=%s, bkr_moved=%s, wqr_moved=%s, wkr_moved=%s, pawn_leapt=%s, pawn_leap_col=%s WHERE id=%s",
        "endChessGame": "UPDATE " + relation + ".chess_games SET completed=true, time_ended=%s, winner=%s WHERE id=%s",

        # Tic-Tac-Toe
        "getTTTGames": "SELECT * FROM " + relation + ".tictactoe_games where (x_player=%s OR o_player=%s)",
        "getTttGame":"SELECT * FROM " + relation + ".tictactoe_games where id=%s",
        "createTttGame": "INSERT INTO " + relation + ".tictactoe_games  (id, x_player, o_player, completed, time_started, last_move, time_ended, player_turn, winner, boardstate) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "updateTttGame": "UPDATE " + relation + ".tictactoe_games SET boardstate=%s, last_move=%s, player_turn=%s WHERE id=%s",
        "endTttGame": "UPDATE " + relation + ".tictactoe_games SET completed=true, time_ended=%s, player_turn='', winner=%s WHERE id=%s",

        # Stats
        "getStat": "SELECT * FROM " + relation + ".stats WHERE userid=%s",
        "updateTttStat": "UPDATE " + relation + ".stats SET ttt_games_played=%s, ttt_wins=%s, ttt_win_percent=%s, ttt_played_x=%s, ttt_played_o=%s, ttt_won_x=%s, ttt_won_o=%s WHERE userid=%s",

        # Messages
        "createMessage": f"INSERT INTO {relation}.messages (gameid, content, username) VALUES (%s, %s, %s)",
        "getMessages": f"SELECT index, username, content FROM {relation}.messages WHERE gameid=%s"

    }

class Pgdb:
    """interacts with a PostgreSQL database of Flaskreactor users and games, for CRUD operations on records."""

    _instance = None

    # overriding new in order to use a Singleton approach, no need to reinstatiate for every Handler that comes up
    # and also to allow for MockPgdb to be used without impacting code in any other file
    def __new__(self, postgres_config):
        
        if not self._instance: # first time instantiating
            
            env = postgres_config['env']
            if env not in ['local', 'remote', 'none']: 
                print('Invalid postgres env value in app_config:', env)
                exit()

            self.db_env = env  
            print("connecting to environment:",self.db_env)

            if self.db_env == "none": # dev only!
                print('setting DB client to MockPgdb')
                self._instance = MockPgdb()
            else:
                self._instance = super().__new__(self)
        
        return self._instance

    def __init__(self, postgres_config):

        self.config = postgres_config

        try:
            self.conn = connect(
                host     = self.config['local_ip' if self.db_env=='local' else 'remote_ip'],
                database = self.config['database'],
                user     = self.config['user'],
                password = self.config['password']
            )

            self.cursor = self.conn.cursor(cursor_factory=DictCursor)

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
            self.cursor = self.conn.cursor(cursor_factory=DictCursor)
            self.__execute(query, values)

        except InFailedSqlTransaction: # type: ignore
            self.conn.rollback()


    ###### DB QUERY METHODS ######

    ### General
    
    def getUser(self, username: str):
        query = sql['getUser']
        values = [username]
        self.__execute(query, values)
        return self.cursor.fetchone() # TODO use User.dbLoad() here and return that instead, see getChessGame below

    def checkLogin(self, username, password_hash):
        query = sql['checkLogin']
        values = [username, password_hash]
        self.__execute(query, values)
        return self.cursor.fetchone() != None

    def createUser(self, username, password_hash, email, userid, ws_token, quad_color_pref, quad_color_backup):
        query = sql['createUser']
        values = [username, password_hash, email, userid, ws_token, quad_color_pref, quad_color_backup]
        self.__execute(query, values)
        self.conn.commit()

    def createStat(self, userId):
        query = sql['createStat']
        values = [str(userId)]
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
        record = self.cursor.fetchone()
        if (record == None):
            print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
            return None
        return QuadradiusGame.dbLoad(record)

    def getPreferredColors(self, user):
        query = sql['getPreferredColors']
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
        if(record == None):
            print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
            return None
        return ChessGame.dbLoad(record)

    def getChessGames(self, username):
        query = sql['getChessGames']
        values = [username, username]
        self.__execute(query, values)
        return self.cursor.fetchall()

    def updateChessGame(self, new_boardstate, update_time, active_player, newNotation, blackKingMoved, whiteKingMoved, bqrMoved, bkrMoved, wqrMoved, wkrMoved, pawnLeapt, pawnLeapCol, gameid):
        query = sql['updateChessGame']
        values = [Json(new_boardstate), update_time, active_player, newNotation, blackKingMoved, whiteKingMoved, bqrMoved, bkrMoved, wqrMoved, wkrMoved, pawnLeapt, pawnLeapCol, gameid]
        self.__execute(query, values)
        self.conn.commit()

    def endChessGame(self, end_time, winner, gameid):
        query = sql['endChessGame']
        values = [end_time, winner, gameid]
        self.__execute(query, values)
        self.conn.commit()

    ### Tic-Tac-Toe

    def getTttGame(self, gameId):
        query = sql['getTttGame']
        values = [gameId]
        self.__execute(query, values)
        record = self.cursor.fetchone()
        if(record == None):
            print("PGDB ERROR: NO GAME FOUND WITH ID " + gameId)
            return None
        return TttGame.dbCreate(record)

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

    ### Messages

    def createMessage(self, gameId, content, username):
        query = sql['createMessage']
        values = [gameId, content, username]
        self.__execute(query, values)
        self.conn.commit()

    def getMessages(self, gameId):
        query = sql['getMessages']
        values = [gameId]
        self.__execute(query, values)
        return self.cursor.fetchall()

    ####### HELPER METHODS #########

    def userExists(self, username):
        return self.getUser(username) != None
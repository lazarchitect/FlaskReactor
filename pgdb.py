from psycopg2 import connect, InterfaceError, OperationalError
from psycopg2.extras import DictCursor, Json
from json import loads
from models.ChessGame import ChessGame
from models.TttGame import TttGame
from models.User import User
from models.Stats import Stats
from models.Message import Message

relation = "flaskreactor"

sql = {

        #General
        "createUser": "INSERT INTO " + relation + ".users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)",
        "createStat": "INSERT INTO " + relation + ".stats (userid) VALUES (%s)",
        "getUser": "SELECT * FROM " + relation + ".users WHERE name=%s",
        "checkLogin": "SELECT * FROM " + relation + ".users WHERE name=%s AND password_hash=%s",

        # Chess
        "getCompletedChessGames": "SELECT * FROM " + relation + ".chess_games where completed=true AND (white_player=%s OR black_player=%s)",
        "getActiveChessGames": "SELECT * FROM " + relation + ".chess_games where completed=false AND (white_player=%s OR black_player=%s) ORDER BY last_move DESC",  
        "getChessGame": "SELECT * FROM " + relation + ".chess_games WHERE id=%s",
        "createChessGame": "INSERT INTO " + relation + ".chess_games (id, white_player, black_player, boardstate, completed, time_started, last_move, time_ended, player_turn, winner) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "updateChessBoardstate": "UPDATE " + relation + ".chess_games SET boardstate=%s, last_move=%s WHERE id=%s",
        "endChessGame": "UPDATE " + relation + ".chess_games SET time_ended=%s, completed=%s WHERE id=%s",

        # Tic-Tac-Toe
        "getTTTGames": "SELECT * FROM " + relation + ".tictactoe_games where (x_player=%s OR o_player=%s)",
        "getTttGame":"SELECT * FROM " + relation + ".tictactoe_games where id=%s",
        "createTttGame": "INSERT INTO " + relation + ".tictactoe_games  (id, x_player, o_player, boardstate, completed, time_started, last_move, time_ended, player_turn, winner) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "updateTttGame": "UPDATE " + relation + ".tictactoe_games SET boardstate=%s, last_move=%s, player_turn=%s WHERE id=%s",
        "endTttGame": "UPDATE " + relation + ".tictactoe_games SET completed=true, time_ended=%s, player_turn='', winner=%s WHERE id=%s",

        # Stats
        "getStat": "SELECT * FROM " + relation + ".stats WHERE userid=%s",
        "updateTttStat": "UPDATE " + relation + ".stats SET ttt_games_played=%s, ttt_wins=%s, ttt_win_percent=%s, ttt_played_x=%s, ttt_played_o=%s, ttt_won_x=%s, ttt_won_o=%s WHERE userid=%s"


    }

class Pgdb:
    """interacts with a PostgreSQL database of Chesster users and games, for CRUD operations on records."""

    def __init__(self, db_env):

        try:

            dbDetails = loads(open("dbdetails.json", "r").read())
            print("real pgdb instantiating.")
            self.conn = connect(
                host=dbDetails['remote_ip' if db_env=='remote_db' else 'local_ip'],
                database=dbDetails['database'],
                user=dbDetails['user'],
                password=dbDetails['password']
            )

            self.cursor = self.conn.cursor(cursor_factory=DictCursor)

        except OperationalError as oe:
            print(oe)
            exit()

        except KeyError as ke:
            print("dbdetails.json file missing a key:", ke.args[0])
            exit()
        except FileNotFoundError:
            print("you need to add a dbdetails.json file to run the app.")
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
            dbDetails = loads(open("dbdetails.json", "r").read())
            self.conn = connect(
                host=dbDetails['local_ip'],
                database=dbDetails['database'],
                user=dbDetails['user'],
                password=dbDetails['password']
            )
            self.cursor = self.conn.cursor(cursor_factory=DictCursor)
            self.__execute(query, values)

    ###### DB QUERY METHODS ######

    ### General
    
    def getUser(self, username):
        query = sql['getUser']
        values = [username]
        self.__execute(query, values)
        return self.cursor.fetchone()

    def checkLogin(self, username, password_hash):
        query = sql['checkLogin']
        values = [username, password_hash]
        self.__execute(query, values)
        return self.cursor.fetchone() != None

    def createUser(self, username, password_hash, email, userid):
        query = sql['createUser']
        values = [username, password_hash, email, userid]
        self.__execute(query, values)
        self.conn.commit()

    def createStat(self, userId):
        query = sql['createStat']
        values = [str(userId)]
        self.__execute(query, values) 
        self.conn.commit()

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
        return ChessGame.dbCreate(record)

    def getActiveChessGames(self, username):
        query = sql['getActiveChessGames']
        values = [username, username]
        self.__execute(query, values)
        return self.cursor.fetchall()

    def updateChessBoardstate(self, new_boardstate, update_time, gameid):
        query = sql['updateChessBoardstate']
        values = [new_boardstate, update_time, gameid]
        self.__execute(query, values)
        self.conn.commit()

    def endChessGame(self, end_time, gameid):
        query = sql['endChessGame']
        completed = True
        values = [completed, end_time, gameid]
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
        values = [Json(boardstate), last_updated, otherPlayer, gameId]
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

    ####### HELPER METHODS #########

    def userExists(self, username):
        return self.getUser(username) != None
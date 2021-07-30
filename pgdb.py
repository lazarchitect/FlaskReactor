from psycopg2 import connect, InterfaceError
from json import loads
from models.Game import Game
from models.User import User
from models.Stats import Stats
from models.Message import Message

sql = {
        "getCompletedGames": "SELECT * FROM chess.games where completed=true AND (white_player=%s OR black_player=%s)",
        "getActiveGames": "SELECT * FROM chess.games where completed=false AND (white_player=%s OR black_player=%s) ORDER BY last_move DESC",  
        "getUser": "SELECT * FROM chess.users WHERE name=%s",
        "getGame": "SELECT * FROM chess.games WHERE id=%s",
        "checkLogin": "SELECT * FROM chess.users WHERE name=%s AND password_hash=%s",
        
        "createUser": "INSERT INTO chess.users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)",
        "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)",
        "createGame": "INSERT INTO chess.games (id, white_player, black_player, boardstate, completed, time_started, last_move, time_ended) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        
        "updateBoardstate": "UPDATE chess.games SET boardstate=%s, last_move=%s WHERE id=%s",
        "endGame": "UPDATE chess.games SET time_ended=%s, completed=%s WHERE id=%s"
    }

class Pgdb:
    """interacts with a PostgreSQL database of Chesster users and games, for CRUD operations on records."""

    def __init__(self):

        try:

            dbDetails = loads(open("dbdetails.json", "r").read())

            self.conn = connect(
                host=dbDetails['local_ip'],
                database=dbDetails['database'],
                user=dbDetails['user'],
                password=dbDetails['password']
            )

            self.cursor = self.conn.cursor()

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
        except InterfaceError:
            #Connection was closed. reset conn and cursor. (this happens due to idle timeouts.)
            dbDetails = loads(open("dbdetails.json", "r").read())
            self.conn = connect(
                host=dbDetails['local_ip'],
                database=dbDetails['database'],
                user=dbDetails['user'],
                password=dbDetails['password']
            )
            self.cursor = self.conn.cursor()
            self.__execute(query, values)

    ###### DB QUERY METHODS ######

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

    def createGame(self, g):
        query = sql['createGame']
        values = g.toTuple()
        self.__execute(query, values)
        self.conn.commit()

    def getGame(self, gameId):
        query = sql['getGame']
        values = [gameId]
        self.__execute(query, values)
        game = Game.dbCreate(self.cursor.fetchone())
        return game

    #TODO return list of Game() objects instead of tuples?
    def getActiveGames(self, username):
        query = sql['getActiveGames']
        values = [username, username]
        self.__execute(query, values)
        return self.cursor.fetchall()

    def updateBoardstate(self, new_boardstate, update_time, gameid):
        query = sql['updateBoardstate']
        values = [new_boardstate, update_time, gameid]
        self.__execute(query, values)
        self.conn.commit()

    def endGame(self, end_time, gameid):
        query = sql['endGame']
        completed = True
        values = [completed, end_time, gameid]
        self.__execute(query, values)
        self.conn.commit()

    ####### HELPER METHODS #########

    def userExists(self, username):
        return self.getUser(username) != None
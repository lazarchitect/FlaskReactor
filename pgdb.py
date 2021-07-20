from psycopg2 import connect
from json import loads
from models.Game import Game
from models.User import User
from models.Stats import Stats
from models.Message import Message

# sql = {
#         "getCompletedGames": "SELECT * FROM chess.games where completed=true AND (white_player=%s OR black_player=%s)",
#         "getActiveGames": "SELECT * FROM chess.games where completed=false AND (white_player=%s OR black_player=%s) ORDER BY last_move DESC",  
#         "getUser": "SELECT * FROM chess.users WHERE name=%s",
#         "getGame": "SELECT * FROM chess.games WHERE id=%s",
#         "checkLogin": "SELECT * FROM chess.users WHERE name=%s AND password_hash=%s",
        
#         "createUser": "INSERT INTO chess.users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)",
#         "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)",
#         "createGame": "INSERT INTO chess.games (id, white_player, black_player, boardstate, completed, time_started, last_move) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        
#         "updateBoardstate": "UPDATE chess.games SET boardstate=%s, last_move=%s WHERE id=%s",
#         "endGame": "UPDATE chess.games SET time_ended=%s, completed=%s WHERE id=%s"
        
#     }

class Pgdb:

    def __init__(self):
        dbDetails = loads(open("dbdetails.json", "r").read())

        self.conn = connect(
            host=dbDetails['host'],
            database=dbDetails['database'],
            user=dbDetails['user'],
            password=dbDetails['password']
        )

        self.cursor = self.conn.cursor()


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
        "endGame": "UPDATE chess.games SET completed=%s, time_ended=%s WHERE id=%s"

    }


    def getUser(self, username):
        self.cursor.execute(sql['getUser'], [username])
        return self.cursor.fetchone()

    def checkLogin(self, username, password_hash):
        self.cursor.execute(sql['checkLogin'], [username, password_hash])
        return self.cursor.fetchone() != None


    def createUser(self, username, password_hash, email, userid):
        query = sql['createUser']
        values = [username, password_hash, email, userid]
        self.cursor.execute(query, values)
        self.conn.commit()

    def createStat(self, userId):
        query = sql['createStat']
        values = [str(userId)]
        self.cursor.execute(query, values) 
        self.conn.commit()


    def createGame(self, g):
        query = sql['createGame']
        values = g.toTuple()
        self.cursor.execute(query, values)
        self.conn.commit()

    def getGame(self, gameId):
        query = sql['getGame']
        values = [gameId]
        self.cursor.execute(query, values)
        game = Game(self.cursor.fetchone())
        return game

    #TODO return list of Game() objects instead of tuples?
    def getActiveGames(self, username):
        query = sql['getActiveGames']
        values = [username, username]
        self.cursor.execute(query, values)
        return self.cursor.fetchall()

    def updateBoardstate(self, new_boardstate, update_time, gameid):
        query = sql['updateBoardstate']
        values = [new_boardstate, update_time, gameid]
        self.cursor.execute(query, values)
        self.conn.commit()

    def endGame(self, end_time, gameid):
        query = sql['endGame']
        completed = True
        values = [completed, end_time, gameid]
        self.cursor.execute(query, values)
        self.conn.commit()

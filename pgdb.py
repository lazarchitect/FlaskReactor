from psycopg2 import connect
from json import loads

dbDetails = loads(open("dbdetails.json", "r").read())

conn = connect(
    host=dbDetails['host'],
    database=dbDetails['database'],
    user=dbDetails['user'],
    password=dbDetails['password']
)

cursor = conn.cursor()

sql = {
    "getUser": "SELECT * FROM chess.users WHERE name=%s",
    "getGame": "SELECT * FROM chess.games WHERE id=%s",
    "checkLogin": "SELECT * FROM chess.users WHERE name=%s AND password_hash=%s",
    "createUser": "INSERT INTO chess.users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)",
    "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)",
    "createGame": "INSERT INTO chess.games (id, white_player, black_player, boardstate, completed, time_started) VALUES (%s, %s, %s, %s, %s, %s)"
}

def checkIfUsernameTaken(username):
    cursor.execute(sql['getUser'], [username])
    return cursor.fetchone() != None

def checkLogin(username, password_hash):
    cursor.execute(sql['checkLogin'], [username, password_hash])
    return cursor.fetchone() != None

def createUser(username, password_hash, email, userid):
    query = sql['createUser']
    values = [username, password_hash, email, userid]
    cursor.execute(query, values)
    conn.commit()

def createStat(userId):
    query = sql['createStat']
    values = [str(userId)]
    cursor.execute(query, values) 
    conn.commit()

def createGame(gameid, white_player, black_player, boardstate, completed, time_started):
    query = sql['createGame']
    values = [gameid, white_player, black_player, boardstate, completed, time_started]
    cursor.execute(query, values)
    conn.commit()

def getGame(gameId):
    query = sql['getGame']
    values = [gameId]
    cursor.execute(query, values)
    game = cursor.fetchone()
    print(game)
    return game
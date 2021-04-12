from psycopg2 import connect
from json import loads

dbDetails = loads(open("dbdetails.json", "r").read())

print("---establishing database connection---")
conn = connect(
    host=dbDetails['host'],
    database=dbDetails['database'],
    user=dbDetails['user'],
    password=dbDetails['password']
)

cursor = conn.cursor()

sql = {
    "getCompletedGames": "SELECT * FROM chess.games where completed=true AND (white_player=%s OR black_player=%s)",
    "getActiveGames": "SELECT * FROM chess.games where completed=false AND (white_player=%s OR black_player=%s) ORDER BY last_move DESC",  
    "getUser": "SELECT * FROM chess.users WHERE name=%s",
    "getGame": "SELECT * FROM chess.games WHERE id=%s",
    "checkLogin": "SELECT * FROM chess.users WHERE name=%s AND password_hash=%s",
    
    "createUser": "INSERT INTO chess.users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)",
    "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)",
    "createGame": "INSERT INTO chess.games (id, white_player, black_player, boardstate, completed, time_started, last_move) VALUES (%s, %s, %s, %s, %s, %s, %s)",
    
    "updateBoardstate": "UPDATE chess.games SET boardstate=%s, last_move=%s WHERE id=%s",
    "endGame": "UPDATE chess.games SET time_ended=%s, completed=%s WHERE id=%s"
    
}

def getUser(username):
    cursor.execute(sql['getUser'], [username])
    return cursor.fetchone()

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

def createGame(gameid, white_player, black_player, boardstate, completed, time_started, last_move):
    query = sql['createGame']
    values = [gameid, white_player, black_player, boardstate, completed, time_started, last_move]
    cursor.execute(query, values)
    conn.commit()

def getGame(gameId):
    query = sql['getGame']
    values = [gameId]
    cursor.execute(query, values)
    game = cursor.fetchone()
    print(game)
    return game

def getActiveGames(username):
    query = sql['getActiveGames']
    values = [username, username]
    cursor.execute(query, values)
    return cursor.fetchall()

def updateBoardstate(new_boardstate, update_time, gameid):
    query = sql['updateBoardstate']
    values = [new_boardstate, update_time, gameid]
    cursor.execute(query, values)
    conn.commit()

def endGame(end_time, gameid):
    query = sql['endGame']
    completed = True
    values = [end_time, completed, gameid]
    cursor.execute(query, values)
    conn.commit()
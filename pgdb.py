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
    "checkLogin": "SELECT * FROM chess.users WHERE name=%s AND password_hash=%s",
    "createUser": "INSERT INTO chess.users (name, password_hash, email, id) VALUES (%s, %s, %s, %s)", #TODO add all values, not just name
    "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)" #TODO see above
}

def checkIfUserExists(username):
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

from psycopg2 import connect
from json import loads
from uuid import uuid4 as generateId

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
    "createUser": "INSERT INTO chess.users (name, password_hash, id) VALUES (%s, %s, %s)", #TODO add all values, not just name
    "createStat": "INSERT INTO chess.stats (userid) VALUES (%s)" #TODO see above
}

def userExists(username):
    cursor.execute(sql['getUser'], [username])
    return cursor.fetchone() != None

def createUser(username):
    userId = generateId()
    cursor.execute(sql['createUser'], [username, "passworderino! WIP!", str(userId)])
    cursor.execute(sql['createStat'], [str(userId)]) 
    conn.commit()
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
    "getUser": "SELECT * FROM chess.\"Users\" where name=%s",
    "createUser": "INSERT INTO chess.\"Users\" (name, password_hash) VALUES (%s, %s)" #todo add all values, not just name
}



def userExists(username):
    cursor.execute(sql['getUser'], [username])
    # print(cursor.fetchone())
    return cursor.fetchone() != None

def createUser(username):
    cursor.execute(sql['createUser'], [username, "passworderino! WIP!"])
    print(cursor.fetchone())
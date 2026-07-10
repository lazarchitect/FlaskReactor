from src.backend.pgdb import getPgdb
from src.backend.utils import generateId, generateHash

def createUser(email, password, username):

    pgdb = getPgdb()

    password_hash = generateHash(password)

    ws_token = str(generateId())[:8]

    user = newUser(username, password_hash, email, ws_token)
    pgdb.createUser(user)
    pgdb.createStat(user['id'])  # can align this with other create fns later

def newUser(name, password_hash, email, ws_token):
    return {
        "name": name,
        "password_hash": password_hash,
        "email": email,
        "ws_token": ws_token,
        "id": generateId()
    }

def updatePassword(username, password):
    pgdb = getPgdb()
    password_hash = generateHash(password)
    pgdb.updatePassword(username, password_hash)
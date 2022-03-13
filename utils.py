from uuid import uuid4
from hashlib import sha256
from tornado.websocket import WebSocketClosedError
import json

tttSets = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

def generateId():
    return uuid4()

def generateHash(password):
    return sha256(password.encode('utf8')).hexdigest()

def tttTriple(a, b, c):
    return a == b and b == c and a != ''

def tttGameEnded(b):
    for set in tttSets:
        if tttTriple(b[set[0]], b[set[1]], b[set[2]]):
            return "Win"
    
    if '' not in b:
        return "Tie"

    return False

def printChessboard(b):
    retval = ""
    for row in b:
        for tile in row:
            piece = tile.get("piece")
            if piece is None: 
                retval += ("  ")
            else: 
                retval += pieceCode(piece)
            retval += " "
        retval += "\n"
    print(retval)

def pieceCode(p):
    if(p["type"]=="Knight"): return p["color"][0] + "N"
    return p["color"][0] + p["type"][0]

def updateAll(connections, message):
    for connectionDetails in connections:
        try:
            connectionDetails['conn'].write_message(json.dumps(message))
        except WebSocketClosedError:
            pass
            #print(str(connectionDetails['id']) + " was closed i guess? nvm...")
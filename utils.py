from uuid import uuid4
from hashlib import sha256
from tornado.websocket import WebSocketClosedError
import json

tttSets = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

knightOffsets = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]


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

def outOfBounds(coords):
    row = coords[0]
    col = coords[1]
    return row < 0 or row > 7 or col < 0 or col > 7

def isPiece(boardstate, coords, pieceType, pieceColor):
    if(outOfBounds(coords)): return False
    piece = boardstate[coords[0]][coords[1]].get("piece")
    if(piece == None): return False
    return piece.get("type") == pieceType and piece.get("color") == pieceColor

def getKingCoords(boardstate, color):
    for row in range(8):
        for col in range(8):
            if(isPiece(boardstate, (row, col), "King", color)):
                return (row, col)
    return None #should never happen?

def inCheck(boardstate, enemyColor, kingCoords):
    for offset in knightOffsets:
        knightCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if(isPiece(boardstate, knightCoords, "Knight", enemyColor)):
            return True
    
    pawnDirection = 1 if enemyColor == "White" else -1
    pawnLeftCoords = (kingCoords[0] + pawnDirection, kingCoords[1] - 1)
    pawnRightCoords= (kingCoords[0] + pawnDirection, kingCoords[1] + 1)

    if(isPiece(boardstate, pawnLeftCoords, "Pawn", enemyColor)):
        return True
    if(isPiece(boardstate, pawnRightCoords, "Pawn", enemyColor)):
        return True

    # TODO look around for enemy bishops, queens, and rooks.

    return False


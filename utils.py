from re import T
from uuid import uuid4
from hashlib import sha256
from tornado.websocket import WebSocketClosedError
import json

tttSets = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

knightOffsets = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]
rookOffsets = [[0,1],[0,-1],[1,0],[-1,0]]
bishopOffsets = [[1,1],[1,-1],[-1,1],[-1,-1]]


def generateId():
    return uuid4()

def generateHash(password):
    return sha256(password.encode('utf8')).hexdigest()

def updateAll(connections, message):
    for connectionDetails in connections:
        try:
            connectionDetails['conn'].write_message(json.dumps(message))
        except WebSocketClosedError:
            pass
            #print(str(connectionDetails['id']) + " was closed i guess? nvm...")

### TIC TAC TOE ###

def tttTriple(a, b, c):
    return a == b and b == c and a != ''

def tttGameEnded(b):
    for set in tttSets:
        if tttTriple(b[set[0]], b[set[1]], b[set[2]]):
            return "Win"
    
    if '' not in b:
        return "Tie"

    return False

### CHESS ###

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

def outOfBounds(coords):
    row = coords[0]
    col = coords[1]
    return row < 0 or row > 7 or col < 0 or col > 7

def isPiece(boardstate, coords, pieceType, pieceColor):
    if(outOfBounds(coords)): return False
    piece = boardstate[coords[0]][coords[1]].get("piece")
    if(piece == None): return False
    return piece.get("type") == pieceType and piece.get("color") == pieceColor

def pieceMatch(piece, pieceColor, pieceType):
    return piece.get("color") == pieceColor and piece.get("type") == pieceType

def hasPiece(boardstate, coords):
    piece = boardstate[coords[0]][coords[1]].get("piece")
    return piece != None

def getPiece(boardstate, coords):
    return boardstate[coords[0]][coords[1]].get("piece")

def getKingCoords(boardstate, color):
    for row in range(8):
        for col in range(8):
            if(isPiece(boardstate, (row, col), "King", color)):
                return (row, col)
    return None #should never happen?

# starting at King to check for check, scans a direction to see the closest piece that way.
def pieceTowards(boardstate, coords, offset):
    targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
    if outOfBounds(targetCoords): 
        return None
    if hasPiece(boardstate, targetCoords):
        return getPiece(boardstate, targetCoords)
    return pieceTowards(boardstate, targetCoords, offset)

def inCheck(boardstate, enemyColor, kingCoords):
    
    # LOOK FOR KNIGHTS
    for offset in knightOffsets:
        knightCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if isPiece(boardstate, knightCoords, "Knight", enemyColor):
            return True
    
    # LOOK FOR PAWNS
    pawnDirection = 1 if enemyColor == "White" else -1
    pawnLeftCoords = (kingCoords[0] + pawnDirection, kingCoords[1] - 1)
    pawnRightCoords= (kingCoords[0] + pawnDirection, kingCoords[1] + 1)
    if isPiece(boardstate, pawnLeftCoords, "Pawn", enemyColor):
        return True
    if(isPiece(boardstate, pawnRightCoords, "Pawn", enemyColor)):
        return True

    # LOOK FOR ROOKS/QUEENS
    for offset in rookOffsets:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece != None:
            if pieceMatch(piece, enemyColor, "Rook") or pieceMatch(piece, enemyColor, "Queen"):
                return True 

    # LOOK FOR BISHOPS/QUEENS
    for offset in bishopOffsets:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece != None:
            if pieceMatch(piece, enemyColor, "Bishop") or pieceMatch(piece, enemyColor, "Queen"):
                return True

    return False

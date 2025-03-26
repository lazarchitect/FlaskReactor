from re import T
from uuid import uuid4
from hashlib import sha256
from tornado.websocket import WebSocketClosedError
import json
import copy

tttSets = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

knightOffsets = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]
rookOffsets = [[0,1],[0,-1],[1,0],[-1,0]]
bishopOffsets = [[1,1],[1,-1],[-1,1],[-1,-1]]
royalOffsets = [[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]]


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
    row, col = coords
    print("is this out of bounds? " + row + " " + col)
    return row < 0 or row > 7 or col < 0 or col > 7

def isPiece(boardstate, coords, pieceType, pieceColor):
    if(outOfBounds(coords)): return False
    #print("\n\n coords:", coords, ". board:", boardstate, "\n\n\n")
    piece = boardstate[coords[0]][coords[1]].get("piece")
    if(piece == None): return False
    return piece.get("type") == pieceType and piece.get("color") == pieceColor

def pieceMatch(piece, pieceColor, pieceType):
    return piece.get("color") == pieceColor and piece.get("type") == pieceType

def getPiece(boardstate, coords):
    return boardstate[coords[0]][coords[1]].get("piece")

def hasPiece(boardstate, coords):
    return getPiece(boardstate, coords) != None

def hasColorPiece(boardstate, coords, color):
    piece = getPiece(boardstate, coords)
    return piece != None and piece.get("color") == color

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
    
    # LOOK FOR KINGS
    for offset in royalOffsets:
        coords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if isPiece(boardstate, coords, "King", enemyColor):
            return True
    
    # LOOK FOR KNIGHTS
    for offset in knightOffsets:
        coords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if isPiece(boardstate, coords, "Knight", enemyColor):
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

def knightCanMove(boardstate, coords, pieceColor, enemyColor):
    newBoardstate = copy.deepcopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    if inCheck(newBoardstate, enemyColor, getKingCoords(newBoardstate, pieceColor)):
        return False

    for offset in knightOffsets:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if not outOfBounds(targetCoords) and not hasColorPiece(boardstate, targetCoords, pieceColor):    
            return True
    
    return False


def pawnCanMove(boardstate, coords, pieceColor, enemyColor):
    
    newBoardstate = copy.deepcopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    if inCheck(newBoardstate, enemyColor, getKingCoords(newBoardstate, pieceColor)):
        return False
    
    # look at 1 tile ahead, and enemies in diag spots
    direction = 1 if pieceColor == "Black" else -1
    targetCoords = (coords[0] + direction, coords[1])
    if not hasColorPiece(boardstate, targetCoords, pieceColor):
        return True
    targetCoords = (coords[0] + direction, coords[1] + 1) # right attack
    if not outOfBounds(targetCoords) and hasColorPiece(boardstate, targetCoords, enemyColor):
        return True
    targetCoords = (coords[0] + direction, coords[1] + -1) # left attack
    if not outOfBounds(targetCoords) and hasColorPiece(boardstate, targetCoords, enemyColor):
        return True
    return False

def queenCanMove(boardstate, coords, pieceColor, enemyColor):
    newBoardstate = copy.deepcopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    if inCheck(newBoardstate, enemyColor, getKingCoords(newBoardstate, pieceColor)):
        return False
    
    for offset in royalOffsets:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if not outOfBounds(targetCoords) and not hasColorPiece(boardstate, targetCoords, pieceColor):    
            return True
    return False

def kingCanMove(boardstate, coords, pieceColor, enemyColor):
    
    for offset in royalOffsets:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if not outOfBounds(targetCoords) and not hasColorPiece(boardstate, targetCoords, pieceColor):    
            
            # TODO CHECK IF KING WOULD NOW BE IN CHECK IF HE MOVED HERE
            
            return True
    return False

def rookCanMove(boardstate, coords, pieceColor, enemyColor):
    newBoardstate = copy.deepcopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    if inCheck(newBoardstate, enemyColor, getKingCoords(newBoardstate, pieceColor)):
        return False
    
    for offset in rookOffsets:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if not outOfBounds(targetCoords) and not hasColorPiece(boardstate, targetCoords, pieceColor):    
            return True
    return False

def bishopCanMove(boardstate, coords, pieceColor, enemyColor):
    newBoardstate = copy.deepcopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    if inCheck(newBoardstate, enemyColor, getKingCoords(newBoardstate, pieceColor)):
        return False
    
    for offset in bishopOffsets:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if not outOfBounds(targetCoords) and not hasColorPiece(boardstate, targetCoords, pieceColor):    
            return True
    return False

def canMove(boardstate, coords, pieceColor):

    enemyColor = "Black" if pieceColor == "White" else "White"
    piece = getPiece(boardstate, coords)
    type = piece.get("type")

    if type == "Knight":
        return knightCanMove(boardstate, coords, pieceColor, enemyColor)
    elif type == "Pawn":
        return pawnCanMove(boardstate, coords, pieceColor, enemyColor)
    elif type == "Rook":
        return rookCanMove(boardstate, coords, pieceColor, enemyColor) # only need to check adjacent tiles
    elif type == "Queen":
        return queenCanMove(boardstate, coords, pieceColor, enemyColor) # only need to check adjacent tiles
    elif type == "King":
        return kingCanMove(boardstate, coords, pieceColor, enemyColor)
    elif type == "Bishop":
        return bishopCanMove(boardstate, coords, pieceColor, enemyColor) # only need to check adjacent tiles

def noLegalMoves(boardstate, playerColor):
    # determines if player <playerColor> cannot make any moves.

    # related to issue #81 and #82

    # if inCheck(boardstate, enemyColor, getKingCoords(boardstate, playerColor)):
    #     # only return false if you find a move which will get you out of check
        
    #     return True
    
    for row in range(8):
        for col in range(8):
            coords = (row, col)
            if hasColorPiece(boardstate, coords, playerColor):
                if canMove(boardstate, coords, playerColor):
                    return False
    return True

def numberToLetter(i):
    # turns a number representing a chessboard column into its corresponding letter.
    if i > 7 or i < 0 : return
    # zero indexed?
    return 'abcdefgh'[i]
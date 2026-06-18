import copy

from src.backend.services.chess.chessConsts import royalOffsets, rookOffsets, bishopOffsets
from src.backend.utils import hasColorPiece, getPiece, getKingCoords, inCheck, outOfBounds, knightOffsets


# def listLegalMoves(boardstate, color):
#     legalMoves = []
#     for all rows:
#         for all columns:
#             if tile at row,col contains piece of given color:
#                 sourcePiece = pieceAt(row,col)
#                 moveTargets = placesThatPieceCanMove(boardstate, sourcePiece)
#                 for target in moveTargets:
#                     if sourcePiece moves to target and color is not in check afterwards:
#                         legalMoves.append((here, target))
#
#     return legalMoves

# determines if a player cannot make any moves.
def noLegalMoves(boardstate, playerColor):

    for row in range(8):
        for col in range(8):
            coords = (row, col)
            if hasColorPiece(boardstate, coords, playerColor):
                if canMove(boardstate, coords, playerColor):
                    return False # early return if any move at all is found
    return True

def canMove(boardstate, coords, pieceColor):
    enemyColor = "Black" if pieceColor == "White" else "White"
    piece = getPiece(boardstate, coords)
    pieceType = piece.get("type")

    if pieceType == "Knight":
        return knightCanMove(boardstate, coords, pieceColor, enemyColor)
    elif pieceType == "Pawn":
        return pawnCanMove(boardstate, coords, pieceColor, enemyColor)
    elif pieceType == "Rook":
        return rookCanMove(boardstate, coords, pieceColor, enemyColor)  # only need to check adjacent tiles
    elif pieceType == "Queen":
        return queenCanMove(boardstate, coords, pieceColor, enemyColor)  # only need to check adjacent tiles
    elif pieceType == "King":
        return kingCanMove(boardstate, coords, pieceColor, enemyColor)
    elif pieceType == "Bishop":
        return bishopCanMove(boardstate, coords, pieceColor, enemyColor)  # only need to check adjacent tiles
    return None


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
    targetCoords = (coords[0] + direction, coords[1] + 1)  # right attack
    if not outOfBounds(targetCoords) and hasColorPiece(boardstate, targetCoords, enemyColor):
        return True
    targetCoords = (coords[0] + direction, coords[1] + -1)  # left attack
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
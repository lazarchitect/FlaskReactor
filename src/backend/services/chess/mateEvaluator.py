from copy import deepcopy as deepCopy

from src.backend.services.chess.chessConsts import ROYAL_OFFSETS, ROOK_OFFSETS, BISHOP_OFFSETS, KNIGHT_OFFSETS
from src.backend.services.chess.chessUtils import pieceAt, inCheck, outOfBounds, tileAt, sameColor


def hasNoLegalMoves(boardstate, playerColor):

    for row in range(8):
        for col in range(8):
            coords = (row, col)
            if tileAt(boardstate, coords).hasA(playerColor, "any"):
                if canMove(boardstate, coords, playerColor):
                    return False # early return if any move at all is found
    return True

def canMove(boardstate, coords, pieceColor) -> bool:
    """assumes there is a piece at coords"""

    piece = pieceAt(boardstate, coords)
    assert piece is not None # fn is only ever called on valid pieces

    match piece.type:
        case "Knight": return knightCanMove(boardstate, coords, pieceColor)
        case "Pawn":   return pawnCanMove(boardstate, coords, pieceColor)
        case "Rook":   return rookCanMove(boardstate, coords, pieceColor)
        case "Queen":  return queenCanMove(boardstate, coords, pieceColor)
        case "King":   return kingCanMove(boardstate, coords, pieceColor)
        case "Bishop": return bishopCanMove(boardstate, coords, pieceColor)
        case _: return False

def knightCanMove(boardstate, coords, pieceColor):

    if pieceIsBlockingCheck(boardstate, coords, pieceColor):
        return False

    for offset in KNIGHT_OFFSETS:
        targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
        if outOfBounds(targetCoords): continue
        if not sameColor(pieceColor, pieceAt(boardstate, targetCoords)):
            return True

    return False


def pawnCanMove(boardstate, coords, pieceColor):

    if pieceIsBlockingCheck(boardstate, coords, pieceColor):
        return False

    direction = 1 if pieceColor == "Black" else -1

    # look at 1 tile ahead to see if no pieces are there
    advance1Coords = (coords[0] + direction, coords[1])
    if pieceAt(boardstate, advance1Coords) is None:
        return True

    ### TODO advance 2 aka pawnLeap is needed here, right?

    # see if there are enemies in diagonal attack vectors
    rightAttackCoords = (coords[0] + direction, coords[1] + 1)
    if not outOfBounds(rightAttackCoords) and not sameColor(pieceColor, pieceAt(boardstate, rightAttackCoords)):
        return True

    leftAttackCoords = (coords[0] + direction, coords[1] + -1)
    if not outOfBounds(leftAttackCoords) and not sameColor(pieceColor, pieceAt(boardstate, leftAttackCoords)):
        return True

    return False

def queenCanMove(boardstate, coords, pieceColor):

    if pieceIsBlockingCheck(boardstate, coords, pieceColor): return False

    validMoveTargets = []
    for offset in ROYAL_OFFSETS:
        offsetRow, offsetCol = offset
        pieceRow, pieceCol = coords
        scan(boardstate, coords, offsetRow, offsetCol, pieceRow, pieceCol, pieceColor, validMoveTargets)
        if len(validMoveTargets) > 0:
            return True # early return each offset for performance

    return False


def kingCanMove(boardstate, srcCoords, pieceColor):
    srcRow, srcCol = srcCoords

    for offset in ROYAL_OFFSETS:

        targetCoords = (srcCoords[0] + offset[0], srcCoords[1] + offset[1])

        if outOfBounds(targetCoords):
            continue

        if not tileAt(boardstate, targetCoords).hasA(pieceColor, "any"):
            newBoardstate = deepCopy(boardstate)
            newBoardstate[targetCoords[0]][targetCoords[1]] = newBoardstate[srcRow][srcCol]
            newBoardstate[srcRow][srcCol] = {}
            if not inCheck(newBoardstate, pieceColor):
                return True
    return False


def rookCanMove(boardstate, coords, pieceColor):

    if pieceIsBlockingCheck(boardstate, coords, pieceColor): return False

    validMoveTargets = []
    for offset in ROOK_OFFSETS:
        offsetRow, offsetCol = offset
        pieceRow, pieceCol = coords
        scan(boardstate, coords, offsetRow, offsetCol, pieceRow, pieceCol, pieceColor, validMoveTargets)
        if len(validMoveTargets) > 0:
            return True # early return each offset for performance

    return False


def bishopCanMove(boardstate, coords, pieceColor):

    if pieceIsBlockingCheck(boardstate, coords, pieceColor): return False

    validMoveTargets = []
    for offset in BISHOP_OFFSETS:
        offsetRow, offsetCol = offset
        pieceRow, pieceCol = coords
        scan(boardstate, coords, offsetRow, offsetCol, pieceRow, pieceCol, pieceColor, validMoveTargets)
        if len(validMoveTargets) > 0:
            return True # early return each offset for performance

    return False


def scan(boardstate, srcCoords, rowOffset, colOffset, row, col, activeColor, validMoveTargets):
    """ Looks along a rank, file, or diagonal to check for open tiles to move to, or enemy pieces to capture.
        Uses recursion to check each tile, increment offsets, and keep reviewing until it goes off the board or hits an ally. """

    destRow, destCol = row + rowOffset, col + colOffset
    destCoords = (destRow, destCol)

    # base case: offset tile has gone off the board.
    if (outOfBounds(destCoords)): return

    targetPiece = pieceAt(boardstate, destCoords)

    # base case - the scan hit a piece.
    if targetPiece is not None:
        if targetPiece.isOpposingColorOf(activeColor):
            if isSafeMove(boardstate, srcCoords, destCoords):
                validMoveTargets.append(str(destRow) + str(destCol))
        return

    # empty tile, add it and keep scanning.
    if isSafeMove(boardstate, srcCoords, destCoords):
        validMoveTargets.append(str(destRow) + str(destCol))

    scan(boardstate, srcCoords, rowOffset, colOffset, destRow, destCol, activeColor,  validMoveTargets)


def isSafeMove(boardstate, srcCoords, destCoords):
    """ Determines if the given move from src to dest would NOT introduce check, or that it would escape any existing check.
        Assumes both coords are within the board. Note - will lead to undefined behavior if there is no piece at srcCoords. */"""
    modifiedBoardstate = previewModifiedBoard(boardstate, srcCoords, destCoords)

    srcPiece = pieceAt(boardstate, srcCoords)
    assert srcPiece is not None
    pieceColor = srcPiece.color

    return not inCheck(modifiedBoardstate, pieceColor)

def previewModifiedBoard(boardstate, srcCoords, destCoords):
    modifiedBoard = deepCopy(boardstate)
    srcRow, srcCol = srcCoords
    destRow, destCol = destCoords

    modifiedBoard[destRow][destCol] = modifiedBoard[srcRow][srcCol]
    modifiedBoard[srcRow][srcCol] = {}

    return modifiedBoard

def pieceIsBlockingCheck(boardstate, coords, pieceColor):
    newBoardstate = deepCopy(boardstate)
    newBoardstate[coords[0]][coords[1]] = {}
    return inCheck(newBoardstate, pieceColor)
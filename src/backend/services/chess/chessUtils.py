from src.backend.services.chess.chessConsts import rookOffsets, bishopOffsets, knightOffsets, royalOffsets


def outOfBounds(coords):
    row, col = coords
    return row < 0 or row > 7 or col < 0 or col > 7


def isPiece(boardstate, coords, pieceType, pieceColor):
    if outOfBounds(coords):
        return False
    piece = boardstate[coords[0]][coords[1]].get("piece")
    if piece is None:
        return False
    return piece.get("type") == pieceType and piece.get("color") == pieceColor


def pieceMatch(piece, pieceColor, pieceType):
    return piece.get("color") == pieceColor and piece.get("type") == pieceType


def getPiece(boardstate, coords) -> dict | None:
    return boardstate[coords[0]][coords[1]].get("piece")


def hasPiece(boardstate, coords):
    return getPiece(boardstate, coords) is not None


def hasColorPiece(boardstate, coords, color):
    piece = getPiece(boardstate, coords)
    return piece is not None and piece.get("color") == color


def getKingCoords(boardstate, color):
    for row in range(8):
        for col in range(8):
            if isPiece(boardstate, (row, col), "King", color):
                return (row, col)
    return None  #should never happen?


# starting at King to check for check, scans a direction to see the closest piece that way.
def pieceTowards(boardstate, coords, offset):
    targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
    if outOfBounds(targetCoords):
        return None
    if hasPiece(boardstate, targetCoords):
        return getPiece(boardstate, targetCoords)
    return pieceTowards(boardstate, targetCoords, offset)


def inCheck(boardstate, enemyColor, kingCoords):
    # LOOK FOR KINGS (assuming no safety)
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
    pawnRightCoords = (kingCoords[0] + pawnDirection, kingCoords[1] + 1)
    if isPiece(boardstate, pawnLeftCoords, "Pawn", enemyColor):
        return True
    if (isPiece(boardstate, pawnRightCoords, "Pawn", enemyColor)):
        return True

    # LOOK FOR ROOKS/QUEENS
    for offset in rookOffsets:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece is not None:
            if pieceMatch(piece, enemyColor, "Rook") or pieceMatch(piece, enemyColor, "Queen"):
                return True

            # LOOK FOR BISHOPS/QUEENS
    for offset in bishopOffsets:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece is not None:
            if pieceMatch(piece, enemyColor, "Bishop") or pieceMatch(piece, enemyColor, "Queen"):
                return True

    return False


def numberToLetter(i):
    """Turns a number representing a chessboard column into its corresponding letter."""
    if i > 7 or i < 0:
        return None
    return 'abcdefgh'[i]
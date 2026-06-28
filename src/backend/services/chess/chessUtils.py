from src.backend.services.chess.chessConsts import ROOK_OFFSETS, BISHOP_OFFSETS, KNIGHT_OFFSETS, ROYAL_OFFSETS, BLACK, \
    WHITE, PAWN, KNIGHT, ROOK, BISHOP, QUEEN, KING


class Tile:
    def __init__(self, row, col, tileData):
        if outOfBounds((row, col)): raise IndexError("tried to access nonexistent tile: " + str((row, col)))
        pieceData = tileData.get("piece")
        piece = Piece(pieceData) if pieceData is not None else None
        self.row = row
        self.col = col
        self.piece = piece
    def hasA(self, color, type): # TODO the type param is never used?
        if type == "any":
            return self.piece is not None and self.piece.color == color
        return self.piece is not None and self.piece.color == color and self.piece.type == type

class Piece:
    def __init__(self, pieceData):
        self.row = pieceData["row"]
        self.col = pieceData["col"]
        self.type = pieceData["type"]
        self.color = pieceData["color"]
        self.id = pieceData["id"]

    def isA(self, color, type):
        return self.color == color and self.type == type

    def isOpposingColorOf(self, otherColor):
        return self.color != otherColor

def outOfBounds(coords):
    row, col = coords
    return row < 0 or row > 7 or col < 0 or col > 7

def tileAt(boardstate, coords) -> Tile:
    """assumes coords is not out of bounds!"""
    row, col = coords
    return Tile(row, col, boardstate[row][col])

def pieceAt(boardstate, coords) -> Piece | None:
    """fetches piece at given location, which might be None. assumes coords is not out of bounds """
    return tileAt(boardstate, coords).piece

def sameColor(srcColor, targetPiece):
    if srcColor is None or targetPiece is None: return False
    return srcColor == targetPiece.color

def getKingCoords(boardstate, color):
    for row in range(8):
        for col in range(8):
            piece = pieceAt(boardstate, (row, col))
            if piece is not None and piece.isA(color, KING):
                return row, col
    return -1,-1  #should never happen


def pieceTowards(boardstate, coords, offset):
    """Determines Check for a King by examining possible lines of attack.
    Recursively scan a direction specified by offset to see the closest piece that way."""
    targetCoords = (coords[0] + offset[0], coords[1] + offset[1])
    if outOfBounds(targetCoords):
        return None
    if pieceAt(boardstate, targetCoords) is not None:
        return pieceAt(boardstate, targetCoords)
    return pieceTowards(boardstate, targetCoords, offset)


# TODO move this to MateEvaluator??
def inCheck(boardstate, yourColor):

    enemyColor = WHITE if yourColor == "Black" else BLACK

    kingCoords = getKingCoords(boardstate, yourColor)

    # LOOK FOR KINGS (assuming no safety)
    for offset in ROYAL_OFFSETS:
        targetCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if outOfBounds(targetCoords): continue
        piece = pieceAt(boardstate, targetCoords)
        if piece is not None and piece.isA(enemyColor, KING):
            return True

    # LOOK FOR KNIGHTS
    for offset in KNIGHT_OFFSETS:
        targetCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1])
        if outOfBounds(targetCoords): continue
        piece = pieceAt(boardstate, targetCoords)
        if piece is not None and piece.isA(enemyColor, KNIGHT):
            return True

    # LOOK FOR PAWNS
    pawnDirection = 1 if enemyColor == "White" else -1
    pawnLeftCoords = (kingCoords[0] + pawnDirection, kingCoords[1] - 1)
    pawnRightCoords = (kingCoords[0] + pawnDirection, kingCoords[1] + 1)
    if not outOfBounds(pawnLeftCoords) and tileAt(boardstate, pawnLeftCoords).hasA(enemyColor, PAWN):
        return True
    if not outOfBounds(pawnRightCoords) and tileAt(boardstate, pawnRightCoords).hasA(enemyColor, PAWN):
        return True

    # LOOK FOR ROOKS/QUEENS
    for offset in ROOK_OFFSETS:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece is not None:
            if piece.isA(enemyColor, ROOK) or piece.isA(enemyColor, QUEEN):
                return True

    # LOOK FOR BISHOPS/QUEENS
    for offset in BISHOP_OFFSETS:
        piece = pieceTowards(boardstate, kingCoords, offset)
        if piece is not None:
            if piece.isA(enemyColor, BISHOP) or piece.isA(enemyColor, QUEEN):
                return True
    return False


def numberToLetter(i):
    """Turns a number representing a chessboard column into its corresponding letter."""
    if i > 7 or i < 0:
        return None
    return 'abcdefgh'[i]

def pieceLetter(pieceType):
    if pieceType == "Knight": return "N"
    return pieceType[0]
from enum import Enum

wkrStartTile = "77"
wknStartTile = "76"
wkbStartTile = "75"
wkStartTile = "74"
wqStartTile = "73"
wqbStartTile = "72"
wqnStartTile = "71"
wqrStartTile = "70"

bkrStartTile = "07"
bknStartTile = "06"
bkbStartTile = "05"
bkStartTile = "04"
bqStartTile = "03"
bqbStartTile = "02"
bqnStartTile = "01"
bqrStartTile = "00"

ROOK = "Rook"
KING = "King"
QUEEN = "Queen"
BISHOP = "Bishop"
KNIGHT = "Knight"
PAWN = "Pawn"

BLACK = "Black"
WHITE = "White"

class MoveType(Enum):
    CASTLE = "Castle"
    EN_PASSANT = "En Passant"
    NORMAL = "Normal"
    # CAPTURE = "Capture"

class MoveSide(Enum):
    QUEENSIDE = "Queenside"
    KINGSIDE = "Kingside"
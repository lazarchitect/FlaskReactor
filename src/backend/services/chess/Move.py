from src.backend.services.chess.chessConsts import *

class Move:
	def __init__(self, srcTileId, destTileId, srcPiece, pawn_leapt, pawn_leap_col):
		self.color = srcPiece["color"]
		self.side = determineSide(destTileId)
		self.piece = srcPiece
		self.srcTileId = srcTileId
		self.destTileId = destTileId
		self.srcCoords = (int(srcTileId[0]), int(srcTileId[1]))
		self.destCoords = (int(destTileId[0]), int(destTileId[1]))
		self.pawn_leapt = pawn_leapt
		self.pawn_leap_col = pawn_leap_col

	def isEnPassant(self) -> bool:
		if self.piece["type"] != PAWN or not self.pawn_leapt: return False

		enemyLeapRow = 4 if self.color == BLACK else 3

		srcRow, srcCol = self.srcCoords
		destRow, destCol = self.destCoords
		# if source is right next to pawn leap col, and src is on the enemy leap row, and dest is in pawn leap col:
		return abs(srcCol - self.pawn_leap_col) == 1 and srcRow == enemyLeapRow and destCol == self.pawn_leap_col

	def isCastling(self):
		if self.piece["type"] == KING:
			if self.srcTileId == bkStartTile and self.destTileId in [bknStartTile, bqbStartTile]:
				return True
			if self.srcTileId == wkStartTile and self.destTileId in [wknStartTile, wqbStartTile]:
				return True

		return False

def determineSide(destTileId):
	if destTileId in [bknStartTile, wknStartTile]:
		return MoveSide.KINGSIDE
	elif destTileId in [bqbStartTile, wqbStartTile]:
		return MoveSide.QUEENSIDE

	return None

def executeMove(boardstate, srcTileId, destTileId):

	srcRow, srcCol = (int(srcTileId[0]), int(srcTileId[1]))
	destRow, destCol = (int(destTileId[0]), int(destTileId[1]))

	srcPiece = boardstate[srcRow][srcCol]["piece"]
	srcType = srcPiece["type"]
	srcColor = srcPiece["color"]
	srcId = srcPiece["id"]

	boardstate[srcRow][srcCol] = {}
	boardstate[destRow][destCol] = {"piece": {"row": destRow, "col": destCol, "type": srcType, "color": srcColor, "id": srcId}}


def executeRookJump(boardstate, move: Move):
	if move.color == BLACK:
		if move.side == MoveSide.QUEENSIDE:
			executeMove(boardstate, bqrStartTile, bqStartTile)
		else:
			executeMove(boardstate, bkrStartTile, bkbStartTile)
	else:  # White
		if move.side == MoveSide.QUEENSIDE:
			executeMove(boardstate, wqrStartTile, wqStartTile)
		else:
			executeMove(boardstate, wkrStartTile, wkbStartTile)

def deletePiece(boardstate, tileId):
	row, col = (int(tileId[0]), int(tileId[1]))
	boardstate[row][col] = {}
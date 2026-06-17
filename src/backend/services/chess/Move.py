from src.backend.services.chess.chessConsts import *

class Move:
	def __init__(self, srcTileId, destTileId, srcPiece):
		self.type = determineType(srcTileId, destTileId, srcPiece)
		self.color = srcPiece["color"]
		self.side = determineSide(destTileId)

def determineType(srcTileId, destTileId, piece):
	if piece["type"] == "King":
		if srcTileId == bkStartTile and destTileId in [bknStartTile, bqbStartTile]:
			return MoveType.CASTLE
		if srcTileId == wkStartTile and destTileId in [wknStartTile, wqbStartTile]:
			return MoveType.CASTLE

	return MoveType.NORMAL


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
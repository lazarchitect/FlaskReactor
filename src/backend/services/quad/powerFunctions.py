from src.backend.services.quad.quadUtils import radial

def raiseTile(context):
	tile = context.tile
	if tile['elevation'] != 5:
		tile['elevation'] += 1

def lowerTile(context):
	tile = context.tile
	if tile['elevation'] != 1:
		tile['elevation'] -= 1

def plateau(context):
	row, col, size, boardstate = context.row, context.col, context.size, context.boardstate

	for affectedRow, affectedCol in radial(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def moat(context):
	row, col, size, boardstate = context.row, context.col, context.size, context.boardstate

	for affectedRow, affectedCol in radial(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1
	boardstate[row][col]['elevation'] = 5

def wall(context):
	row, col, size, rcrFn, boardstate  = context.row, context.col, context.size, context.rcrFn, context.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def trench(context):
	row, col, size, rcrFn, boardstate  = context.row, context.col, context.size, context.rcrFn, context.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1
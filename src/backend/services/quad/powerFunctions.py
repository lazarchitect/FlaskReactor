from src.backend.services.quad.quadUtils import radial, findEmptyLocation, getOrbLocations

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

def multiply(context):
	"""
	Other functions are given some expectation of how the board will look after they are done. Wall raises tiles, Moat lowers and raises, etc.
	Multiply is fundamentally no different. We know at this point that the user has activated Multiply and chosen where to put the new torus.
	All we need to do is modify the boardstate to represent that torus in that location.
	So, the context from the front end should include this. First thing's first, we need to edit the front end code to ensure this.
	It is unique in this regard that there is extra game data incoming that no other power uses, and an extra step on the front end.
	"""
	pass

def relocate(context):
	"""Moves the powered torus to a random empty spot on the board."""
	sourceRow, sourceCol, boardstate = context.row, context.col, context.boardstate

	targetCol, targetRow = findEmptyLocation(boardstate)

	targetTile = boardstate[targetRow][targetCol]
	sourceTile = boardstate[sourceRow][sourceCol]
	targetTile['torus'] = sourceTile['torus']
	del sourceTile['torus']

def orbicRehash(context):
	""" For each orb on the board, find that many empty spots, load new orbs there, then remove the original orbs. """
	boardstate = context.boardstate
	oldOrbLocations = getOrbLocations(boardstate)
	for _ in oldOrbLocations:
		newCol, newRow = findEmptyLocation(boardstate)
		boardstate[newRow][newCol]['orb'] = True # NOTE - later, for Orb Spy, we will need orbs to have identifiable powers via mapped ID in DB
	for (oldRow, oldCol) in oldOrbLocations:
		del boardstate[oldRow][oldCol]['orb']

def twoX(context):
	""" get list of powers for this orb. remove 1 2X and then for all powers, double their count. """
	pass
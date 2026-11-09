from dataclasses import dataclass
from typing import Callable
from src.backend.services.quad.quadUtils import radial, findEmptyLocation, getOrbLocations

@dataclass
class PowerContext:
	row: int
	col: int
	size: int
	tile: dict
	rcrFn: Callable
	boardstate: dict
	activeColor: str
	# "2X" is a power that interacts with other powers, not the board, and as such we will need torus powers context from game obj

def raiseTile(context: PowerContext):
	tile = context.tile
	if tile['elevation'] != 5:
		tile['elevation'] += 1

def lowerTile(context: PowerContext):
	tile = context.tile
	if tile['elevation'] != 1:
		tile['elevation'] -= 1

def plateau(context: PowerContext):
	row, col, size, boardstate = context.row, context.col, context.size, context.boardstate

	for affectedRow, affectedCol in radial(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def moat(context: PowerContext):
	row, col, size, boardstate = context.row, context.col, context.size, context.boardstate

	for affectedRow, affectedCol in radial(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1
	boardstate[row][col]['elevation'] = 5

def wall(context: PowerContext):
	row, col, size, rcrFn, boardstate  = context.row, context.col, context.size, context.rcrFn, context.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def trench(context: PowerContext):
	row, col, size, rcrFn, boardstate  = context.row, context.col, context.size, context.rcrFn, context.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1

def invert(context: PowerContext):
	row, col, size, rcrFn, boardstate  = context.row, context.col, context.size, context.rcrFn, context.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		currElevation = affectedTile['elevation']
		affectedTile['elevation'] = 6 - currElevation

def dredge(context: PowerContext):
	""" this power cares about who is casting it. """
	row, col, size, rcrFn, boardstate, activeColor  = context.row, context.col, context.size, context.rcrFn, context.boardstate, context.activeColor

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] == activeColor:
				affectedTile['elevation'] = 5
			else:
				affectedTile['elevation'] = 1

def destroy(context: PowerContext):
	row, col, size, rcrFn, boardstate, activeColor  = context.row, context.col, context.size, context.rcrFn, context.boardstate, context.activeColor

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] != activeColor:
				del affectedTile['torus']

def relocate(context: PowerContext):
	"""Moves the powered torus to a random empty spot on the board."""
	sourceRow, sourceCol, boardstate = context.row, context.col, context.boardstate

	targetCol, targetRow = findEmptyLocation(boardstate)

	targetTile = boardstate[targetRow][targetCol]
	sourceTile = boardstate[sourceRow][sourceCol]
	targetTile['torus'] = sourceTile['torus']
	del sourceTile['torus']

def orbicRehash(context: PowerContext):
	""" For each orb on the board, find that many empty spots, load new orbs there, then remove the original orbs. """
	boardstate = context.boardstate
	oldOrbLocations = getOrbLocations(boardstate)
	for _ in oldOrbLocations:
		newCol, newRow = findEmptyLocation(boardstate)
		boardstate[newRow][newCol]['orb'] = True # NOTE - later, for Orb Spy, we will need orbs to have identifiable powers via mapped ID in DB
	for (oldRow, oldCol) in oldOrbLocations:
		del boardstate[oldRow][oldCol]['orb']

def twoX(context: PowerContext):
	""" get list of powers for this orb. Double their count. """
	row, col, size, rcrFn, boardstate, activeColor  = context.row, context.col, context.size, context.rcrFn, context.boardstate, context.activeColor
	torusName = boardstate[row][col]['torus']['name']
	# TODO get list of powers via game.playerX_powers via game.active_player
	pass

def recruit(context: PowerContext):
	row, col, size, rcrFn, boardstate, activeColor  = context.row, context.col, context.size, context.rcrFn, context.boardstate, context.activeColor

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] != activeColor:
				torusName = ""
				torusColor = ""
				#swapColor() # will need to move torus's power obj into the other player's dict within the game obj. Maybe the whole game should be in context
				pass

def multiply(context: PowerContext):
	"""
	Other functions are given some expectation of how the board will look after they are done. Wall raises tiles, Moat lowers and raises, etc.
	Multiply is fundamentally no different. We know at this point that the user has activated Multiply and chosen where to put the new torus.
	All we need to do is modify the boardstate to represent that torus in that location.
	So, the context from the front end should include this. First thing's first, we need to edit the front end code to ensure this.
	It is unique in this regard that there is extra game data incoming that no other power uses, and an extra step on the front end.
	"""
	pass
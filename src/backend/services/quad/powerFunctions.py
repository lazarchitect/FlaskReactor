import random

from backend.services.quad.quadUtils import *
from backend.services.quad.PowerContext import PowerContext

def raiseTile(ctxt: PowerContext):
	tile = ctxt.tile
	if tile['elevation'] != 5:
		tile['elevation'] += 1

def lowerTile(ctxt: PowerContext):
	tile = ctxt.tile
	if tile['elevation'] != 1:
		tile['elevation'] -= 1

def plateau(ctxt: PowerContext):
	row, col, size, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.boardstate

	for affectedRow, affectedCol in radialTiles(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def moat(ctxt: PowerContext):
	row, col, size, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.boardstate

	for affectedRow, affectedCol in radialTiles(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1
	boardstate[row][col]['elevation'] = 5

def wall(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 5

def trench(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		boardstate[affectedRow][affectedCol]['elevation'] = 1

def invert(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		currElevation = affectedTile['elevation']
		affectedTile['elevation'] = 6 - currElevation

def dredge(ctxt: PowerContext):
	""" this power cares about who is casting it. """
	row, col, size, rcrFn, boardstate, activeColor  = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate, ctxt.activeColor

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] == activeColor:
				affectedTile['elevation'] = 5
			else:
				affectedTile['elevation'] = 1

def destroy(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate, activeColor = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate, ctxt.activeColor

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] != activeColor:
				del affectedTile['torus']

def twoX(ctxt: PowerContext):
	""" get list of powers for this torus. Double the counts. """
	torus = ctxt.tile['torus']
	torusName = torus['name']
	playerPowers = ctxt.player1Powers if torus['color'] == ctxt.player1Color else ctxt.player2Powers
	torusPowers = playerPowers[torusName]
	for k in torusPowers.keys():
		torusPowers[k]*=2

def relocate(ctxt: PowerContext):
	"""Moves the powered torus to a random empty spot on the board."""
	sourceRow, sourceCol, boardstate = ctxt.row, ctxt.col, ctxt.boardstate

	targetCol, targetRow = findEmptyLocation(boardstate)

	targetTile = boardstate[targetRow][targetCol]
	sourceTile = boardstate[sourceRow][sourceCol]
	targetTile['torus'] = sourceTile['torus']
	del sourceTile['torus']

def orbicRehash(ctxt: PowerContext):
	""" For each orb on the board, find that many empty spots, load new orbs there, then remove the original orbs. """
	boardstate = ctxt.boardstate
	oldOrbLocations = getOrbLocations(boardstate)
	for _ in oldOrbLocations:
		newCol, newRow = findEmptyLocation(boardstate)
		boardstate[newRow][newCol]['orb'] = True # NOTE - later, for Orb Spy, we will need orbs to have identifiable powers via mapped ID in DB
	for (oldRow, oldCol) in oldOrbLocations:
		del boardstate[oldRow][oldCol]['orb']

def scramble(ctxt: PowerContext):
	""" For all affected tiles, remove any tori from them and add the torus to a list.
	    For each torus, place it in a random affected tile which has no torus or orb. (or acidic)"""
	row, col, size, rcrFn, boardstate = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate

	tilesInRange = [boardstate[affRow][affCol] for affRow, affCol in rcrFn(row, col, size)]
	affectedTiles = [tile for tile in tilesInRange if 'orb' not in tile]
	tori = [tile.pop('torus') for tile in affectedTiles if 'torus' in tile]

	while tori: # not empty
		randomDest = random.choice(affectedTiles)
		if 'torus' not in randomDest and 'orb' not in randomDest:
			randomDest['torus'] = tori.pop()

def snakeTunneling(ctxt: PowerContext):
	# TODO work on this next. Build out backend functions before adding front end handling
	pass

def recruit(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate, activeColor = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate, ctxt.activeColor

	activePlayerPowers, inactivePlayerPowers = determinePlayerPowers(ctxt)

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			if torus['color'] != activeColor:
				torusName = torus['name']
				torusPowers = inactivePlayerPowers.get(torusName, None)
				if torusPowers is not None:
					activePlayerPowers[torusName] = torusPowers
					del inactivePlayerPowers[torusName]

				torus['color'] = activeColor

def swap(ctxt: PowerContext):
	row, col, size, rcrFn, boardstate, activeColor = ctxt.row, ctxt.col, ctxt.size, ctxt.rcrFn, ctxt.boardstate, ctxt.activeColor
	inactiveColor = getInactiveColor(ctxt)

	activePlayerPowers, inactivePlayerPowers = determinePlayerPowers(ctxt)

	for affectedRow, affectedCol in rcrFn(row, col, size):
		affectedTile = boardstate[affectedRow][affectedCol]
		if 'torus' in affectedTile:
			torus = affectedTile['torus']
			torusName = torus['name']
			if torus['color'] == activeColor:
				torus['color'] = inactiveColor
				torusPowers = activePlayerPowers.get(torusName, None)
				if torusPowers is not None:
					inactivePlayerPowers[torusName] = torusPowers
					del activePlayerPowers[torusName]
			else:
				torus['color'] = activeColor
				torusPowers = inactivePlayerPowers.get(torusName, None)
				if torusPowers is not None:
					activePlayerPowers[torusName] = torusPowers
					del inactivePlayerPowers[torusName]

def multiply(ctxt: PowerContext):
	"""
	Other functions are given some expectation of how the board will look after they are done. Wall raises tiles, Moat lowers and raises, etc.
	Multiply is fundamentally no different. We know at this point that the user has activated Multiply and chosen where to put the new torus.
	All we need to do is modify the boardstate to represent that torus in that location.
	So, the context from the front end should include this. First thing's first, we need to edit the front end code to ensure this.
	It is unique in this regard that there is extra game data incoming that no other power uses, and an extra step on the front end.
	"""
	pass
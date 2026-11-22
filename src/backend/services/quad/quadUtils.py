from random import randint

def determineRcrFunction(rcr):
	match rcr:
		case "Row": return rowTiles
		case "Column": return columnTiles
		case "Radial": return radialTiles
		case _: raise TypeError("invalid rcr type")

"""
size 1: row-0 -> row+1 (1 rows)
size 2: row-1 -> row+2 (3 rows)
size 3: row-2 -> row+3 (5 rows)

formula: -1*(size-1) -> size
"""

def rowTiles(torusRow, _, size):
	affectedCoords = []
	for r in range((size-1)*-1, size):
		for c in range(10):
			coords = (torusRow + r, c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

def columnTiles(_, torusCol, size):
	affectedCoords = []
	for r in range(8):
		for c in range((size-1)*-1, size):
			coords = (r, torusCol + c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

# creates a list of coords, all impacted tiles within radial effect.
def radialTiles(torusRow, torusCol, size):
	affectedCoords = []
	for r in range(size * -1, size + 1):
		for c in range(size * -1, size + 1):
			coords = (torusRow + r, torusCol + c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

def outOfBounds(coords):
	return coords[0] > 7 or coords[0] < 0	 or coords[1] > 9 or coords[1] < 0

def findEmptyLocation(boardstate):
	""" Randomly finds an open spot on the board and returns those coords. No torus, orb, or acidic. """
	while True:
		x = randint(0, 9)
		y = randint(0, 7)
		if "torus" not in boardstate[y][x] and "orb" not in boardstate[y][x]: # also acidic
			return x, y


def getOrbLocations(boardstate):
	orbLocations = []
	for currRow in range(8):
		for currCol in range(10):
			if 'orb' in boardstate[currRow][currCol]:
				orbLocations.append((currRow, currCol))
	return orbLocations

def determinePlayerPowers(ctxt):
	""" returns 2 things, in order: activePlayerPowers, inactivePlayerPowers """
	if ctxt.activeColor == ctxt.player1Color:
		return ctxt.player1Powers, ctxt.player2Powers
	else:
		return ctxt.player2Powers, ctxt.player1Powers

def getInactiveColor(ctxt):
	return ctxt.player2Color if ctxt.activeColor == ctxt.player1Color else ctxt.player1Color

def combinePowers(powerList1, powerList2) -> dict[str, int]:
	""" adds values from matching keys across the two input dicts.
		Keys with no matches are included with their starting value. """
	assert powerList1 is not None and powerList2 is not None
	return {
		powerName: powerList1.get(powerName, 0) + powerList2.get(powerName, 0)
		for powerName in powerList1.keys() | powerList2.keys()
	}

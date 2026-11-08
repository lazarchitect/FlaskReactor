from random import randint

def determineRcrFunction(rcr):
	match rcr:
		case "Row": return row
		case "Column": return column
		case "Radial": return radial
		case _: raise TypeError("rcr type invalid")


"""
size 1: row-0 -> row+1 (1 rows)
size 2: row-1 -> row+2 (3 rows)
size 3: row-2 -> row+3 (5 rows)

formula: -1*(size-1) -> size
"""

def row(torusRow, _, size):
	affectedCoords = []
	for r in range((size-1)*-1, size):
		for c in range(10):
			coords = (torusRow + r, c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

def column(_, torusCol, size):
	affectedCoords = []
	for r in range(8):
		for c in range((size-1)*-1, size):
			coords = (r, torusCol + c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

# creates a list of coords, all impacted tiles within radial effect.
def radial(torusRow, torusCol, size):
	affectedCoords = []
	for r in range(size * -1, size + 1):
		for c in range(size * -1, size + 1):
			coords = (torusRow + r, torusCol + c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

def outOfBounds(coords):
	return coords[0] > 7 or coords[1] > 9

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

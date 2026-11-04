
# creates a list of coords, all impacted tiles within radial effect.
def radial(torusRow, torusCol, size):
	affectedCoords = []
	for r in range(size * -1, size + 1):
		for c in range(size * -1, size + 1):
			coords = (torusRow + r, torusCol + c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords

# TODO implement row(torusRow, size=1), col(torusCol, size=1) used for wall, trench, and beyond

def outOfBounds(coords):
	return coords[0] > 7 or coords[1] > 9
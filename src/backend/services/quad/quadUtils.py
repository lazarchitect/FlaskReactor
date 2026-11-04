
# creates a list of coords, all impacted tiles within radial effect.
def radial(row, col, radius):
	affectedCoords = []
	for r in range(radius*-1, radius+1):
		for c in range(radius*-1, radius+1):
			coords = (row+r, col+c)
			if outOfBounds(coords): continue
			affectedCoords.append(coords)
	return affectedCoords


def outOfBounds(coords):
	return coords[0] > 7 or coords[1] > 9
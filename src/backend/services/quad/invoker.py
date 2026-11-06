from src.backend.services.quad.quadUtils import radial, rcrFunc


def invokePower(power, rcr, coords, game):

	size = 2
	row, col = coords['row'], coords['col']
	tile = game.boardstate[row][col]

	match power:
	power = Power(powerName, rcr)
	rcrFn = determineRcrFunction(power.rcr)

	# optimization: dict of {string: function()}, which would be O(1) vs O(n)
	match power.name:
		case 'Raise Tile':
			if tile['elevation'] != 5:
				tile['elevation'] += 1
		case 'Lower Tile':
			if tile['elevation'] != 1:
				tile['elevation'] -= 1
		case 'Plateau':
			for affectedRow, affectedCol in radial(row, col, size):
				game.boardstate[affectedRow][affectedCol]['elevation'] = 5
		case 'Moat':
			for affectedRow, affectedCol in radial(row, col, size):
				game.boardstate[affectedRow][affectedCol]['elevation'] = 1
			game.boardstate[row][col]['elevation'] = 5
		case 'Wall':
			if rcr == "Radial": raise ValueError("Wall cannot be radial")
			affectedTiles = rcrFunc(rcr)(row, col, size)
			for affectedRow, affectedCol in affectedTiles:
				game.boardstate[affectedRow][affectedCol]['elevation'] = 5
		case 'Trench':
			if rcr == "Radial": raise ValueError("Trench cannot be radial")
			affectedTiles = rcrFunc(rcr)(row, col, size)
			for affectedRow, affectedCol in affectedTiles:
				game.boardstate[affectedRow][affectedCol]['elevation'] = 1

from src.backend.services.quad.quadUtils import determineRcrFunction
from src.backend.services.quad.powerFunctions import *

POWER_FUNCTIONS = {
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench,
	"Relocate": relocate, "Orbic Rehash": orbicRehash, "2X": twoX
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench, "Invert": invert, "Dredge": dredge,
	"2X": twoX, # Learn, Teach
	"Relocate": relocate, "Orbic Rehash": orbicRehash # Bombs, Smart Bombs
}

def invokePower(power, coords, game):

	size = 1 # growQ will modify this
	row, col = coords['row'], coords['col']
	tile = game.boardstate[row][col]
	activeColor = game.player1_color if game.active_player == game.player1 else game.player2_color

	rcrFn = determineRcrFunction(power.rcr)

	# dispatch logic
	powerLogic = POWER_FUNCTIONS[power.name]
	context = PowerContext(row=row, col=col, size=size, tile=tile, rcrFn=rcrFn, boardstate=game.boardstate, activeColor=activeColor)
	powerLogic(context)
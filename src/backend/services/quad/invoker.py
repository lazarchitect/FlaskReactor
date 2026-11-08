from dataclasses import dataclass
from typing import Callable

from src.backend.services.quad.quadUtils import determineRcrFunction
from src.backend.services.quad.powerFunctions import *

POWER_FUNCTIONS = {
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench,
	"Relocate": relocate, "Orbic Rehash": orbicRehash, "2X": twoX
}

@dataclass
class PowerContext:
	row: int
	col: int
	size: int
	tile: dict
	rcrFn: Callable
	boardstate: dict
	# "2X" is a power that interacts with other powers, not the board, and as such we will need torus powers context from game obj

def invokePower(power, coords, game):

	size = 1 # growQ will modify this
	row, col = coords['row'], coords['col']
	tile = game.boardstate[row][col]

	rcrFn = determineRcrFunction(power.rcr)

	# dispatch logic
	powerLogic = POWER_FUNCTIONS[power.name]
	context = PowerContext(row=row, col=col, size=size, tile=tile, rcrFn=rcrFn, boardstate=game.boardstate)
	powerLogic(context)
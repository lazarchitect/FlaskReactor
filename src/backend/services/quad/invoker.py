
from src.backend.services.quad.quadUtils import determineRcrFunction
from src.backend.services.quad.powerFunctions import *

POWER_FUNCTIONS = {
	"Relocate": relocate, "Orbic Rehash": orbicRehash, "2X": twoX
	# Elevation
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench, "Invert": invert, "Dredge": dredge,
	# Tile Mods
	# Orb Spy, Bankrupt, Power Plant, Hotspot, Refurb, Bunker?
	# Offensive
	"Destroy": destroy, #Pilfer, Inhibit, Acidic, Parasite, Kamikaze, Spyware, Tripwire
	#Power Utilities
	"2X": twoX, # Learn, Teach
	# Mobility Buffs
	# Move Again, Recursive, Flat To Sphere
	# Other Buffs
	# Jump Proof, Grow Quadradius, Scavenger, Centerpult(?), Network Bridge, Invisible
	# RNG effects
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
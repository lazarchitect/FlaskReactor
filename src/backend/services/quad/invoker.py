
from src.backend.services.quad.quadUtils import determineRcrFunction
from src.backend.services.quad.powerFunctions import *

POWER_FUNCTIONS = {
	# Elevation
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench, "Invert": invert, "Dredge": dredge,
	# Tile Mods
	# "Orb Spy": orbSpy, "Bankrupt": bankrupt, "Power Plant": powerPlant, "Hotspot": hotspot, "Refurb": refurb, "Bunker": bunker
	# Offensive
	"Destroy": destroy, #"Pilfer": pilfer, "Inhibit": inhibit, "Acidic": acidic, "Parasite": parasite, "Kamikaze": kamikaze, "Spyware": spyware, "Tripwire": tripwire
	# Power Utilities
	"2x": twoX, # "Learn": learn, "Teach": teach, "Beneficiary": beneficiary,
	# Mobility Torus Mods
	# "Move Again": moveAgain, "Recursive": recursive, "Flat To Sphere": flatToSphere, "Centerpult": centerpult,
	# Other Torus Mods
	# "Jump Proof": jumpProof, "Grow Quadradius": growQuadradius, "Scavenger": scavenger, "Network Bridge": networkBridge, "Invisible": invisible
	# Misc effects
	"Relocate": relocate, "Orbic Rehash": orbicRehash, "Multiply": multiply # "Bombs": bombs, "Smart Bombs": smartBombs
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
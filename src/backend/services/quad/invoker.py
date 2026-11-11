from random import choice

from backend.services.quad.PowerContext import createPowerContext
from backend.services.quad.powerFunctions import *

POWER_FUNCTIONS = {
	### Elevation
	"Raise Tile": raiseTile, "Lower Tile": lowerTile, "Moat": moat, "Plateau": plateau, "Wall": wall, "Trench": trench, "Invert": invert, "Dredge": dredge,
	# Tile Mods
	# "Orb Spy": orbSpy, "Bankrupt": bankrupt, "Power Plant": powerPlant, "Hotspot": hotspot, "Refurb": refurb, "Bunker": bunker
	# Offensive
	"Destroy": destroy, #"Pilfer": pilfer, "Inhibit": inhibit, "Acidic": acidic, "Parasite": parasite, "Kamikaze": kamikaze, "Spyware": spyware, "Tripwire": tripwire
	### Power Utilities
	"2x": twoX, # "Learn": learn, "Teach": teach, "Beneficiary": beneficiary,
	### Mobility Torus Mods
	# "Move Again": moveAgain, "Recursive": recursive, "Flat To Sphere": flatToSphere, "Centerpult": centerpult,
	# "Climb Tile": climbTile, "Switcheroo": switcheroo, "Move Diagonal": moveDiagonal
	### Other Torus Mods
	# "Jump Proof": jumpProof, "Grow Quadradius": growQuadradius, "Scavenger": scavenger, "Network Bridge": networkBridge, "Invisible": invisible
	### RNG effects
	"Relocate": relocate, "Orbic Rehash": orbicRehash, # "Scramble": scramble, "Snake Tunneling": snakeTunneling, "Bombs": bombs, "Smart Bombs": smartBombs
	#### Team Building
	"Multiply": multiply #, "Swap": swap, "Recruit": recruit
}

def invokePower(power, coords, game):

	### FIXME DEBUG LINES, DO NOT MERGE TO MAIN
	power.name = "2x"#choice(["Raise Tile", "Lower Tile", "Moat", "Plateau", "Wall", "Trench"])
	power.rcr = choice(["Row", "Column", "Radial"])
	print(power.name, power.rcr)

	# dispatch logic
	powerLogic = POWER_FUNCTIONS[power.name]
	context = createPowerContext(power, coords, game)
	powerLogic(context)
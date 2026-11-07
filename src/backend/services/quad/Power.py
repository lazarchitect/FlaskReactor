import random

# Subset of powers that impact a given row, column, or radial (NOTE: Wall and Trench are never radial).
RCR_POWERS = ["Refurb","Destroy","Inhibit","Invert","Kamikaze","Acidic","Orb Spy","Parasite","Pilfer","Purify","Dredge","Spyware","Scramble","Swap","Tripwire","Trench","Wall","Recruit","Bankrupt","Learn","Teach"]

ALL_POWERS = ["Multiply","Refurb","Destroy","Inhibit","Invert","Kamikaze","Acidic","Orb Spy","Parasite","Pilfer","Purify","Dredge","Spyware","Scramble","Swap","Tripwire","Relocate","Scavenger","Trench","Wall","Move Diagonal","Centerpult","Climb Tile","2x","Grow Quadradius","Hotspot","Jump Proof","Invisible","Lower Tile","Move Again","Network Bridge","Bunker","Power Plant","Raise Tile","Recursive","Orbic Rehash","Snake Tunneling","Flat To Sphere","Recruit","Bombs","Bankrupt","Learn","Teach","Beneficiary","Moat","Plateau","Switcheroo","Smart Bombs"]
ALL_WEIGHTS =[        99,      75,       75,       75,      75,        75,      75,       75,        75,      75,      75,      75,       75,        75,    75,        75,        70,         70,      50,    50,             50,          50,          50,  50,               50,       50,          50,         50,          50,          50,              50,      50,           50,          50,         50,            50,               50,              50,       45,     40,        30,     30,     30,           25,    25,       25,          25,           15]

class Power:
	name = None
	rcr = None
	key = None
	count = 0

	def __init__(self, name, rcr):
		"""the only way Powers should be handled. Class methods below only wrap this with specific inputs. Includes validation."""
		if name not in ALL_POWERS:
			raise ValueError("power name not supported")
		if name in RCR_POWERS and rcr not in ["Row", "Column", "Radial"]:
			raise ValueError(f"rcr value {rcr} not valid")
		if name in ["Wall", "Trench"] and rcr not in ["Row", "Column"]:
			raise ValueError("Wall and Trench must be Row or Column")

		self.name = name
		self.rcr = rcr

		self.key = name if rcr is None else f"{name}:{rcr}"
		self.count = 1

	@classmethod
	def unpackFromKey(cls, key: str):
		""" Generates a Power from an input key, which simply wraps the name and rcr. Used when handling power data sent from frontend. """
		name = key.split(":")[0]
		rcr = key.split(":")[1] if ":" in key else None
		return cls(name, rcr)

	@classmethod
	def random(cls):
		""" Chooses random power and rcr before generating a Power. The primary way for players, via orbs, to get Powers. """
		name = random.choices(population=ALL_POWERS, weights=ALL_WEIGHTS, k=1)[0] # choices returns a list of k items
		rcr = None
		if name in ["Wall", "Trench"]:
			rcr = random.choice(["Row", "Column"])
		elif name in RCR_POWERS:
			rcr = random.choice(["Row", "Column", "Radial"])
		return cls(name, rcr)

	def __str__(self) -> str:
		return self.key
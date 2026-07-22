import random

RCR_POWERS = ["Refurb","Destroy","Inhibit","Invert","Kamikaze","Acidic","Orb Spy","Parasite","Pilfer","Purify","Dredge","Spyware","Scramble","Swap","Tripwire","Trench","Wall","Recruit","Bankrupt","Learn","Teach"]
# I believe "Wall" cannot be Radial

ALL_POWERS = ["Multiply","Refurb","Destroy","Inhibit","Invert","Kamikaze","Acidic","Orb Spy","Parasite","Pilfer","Purify","Dredge","Spyware","Scramble","Swap","Tripwire","Relocate","Scavenger","Trench","Wall","Move Diagonal","Centerpult","Climb Tile","2x","Grow Quadradius","Hotspot","Jump Proof","Invisible","Lower Tile","Move Again","Network Bridge","Bunker","Power Plant","Raise Tile","Recursive","Orbic Rehash","Snake Tunneling","Flat To Sphere","Recruit","Bombs","Bankrupt","Learn","Teach","Beneficiary","Moat","Plateau","Switcheroo","Smart Bombs"]

class Power:
	name = None
	rcr = None
	count = 0

	def __init__(self):
		self.name = random.choice(ALL_POWERS)
		self.count = 1
		if self.name in RCR_POWERS:
			self.rcr = random.choice(["Row", "Column", "Radial"])
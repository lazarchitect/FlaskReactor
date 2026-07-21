
# can define torus colors list here as well

# These need to be randomly assigned row, column, or radial if chosen
RCR_POWERS = []

ALL_POWERS = ["Multiply","refurb","Destroy","Inhibit","Invert","Kamikaze","Acid","Orb Spy","Parasite","Pilfer","Purify","Dredge","Spyware","Scramble","Swap","Tripwire","Relocate","Scavenger","Trench","Wall","Move Diagonal","Centerpult","Climb","2x","Grow Quadradius","Hotspot","Jump Proof","Invisible","Lower Tile","Move Again","Network Bridge","Bunker","Power Plant","Raise Tile","Recursive","Orbic Rehash","Snake Tunneling","Flat To Sphere","Recruit","Bombs","Bankrupt","Learn","Teach","Beneficiary","Moat","Plateau","Switcheroo","Smart Bombs"]

class Power:
	name = None
	rcr = None
	count = 0

	def __init__(self, name, rcr):
		self.name = name
		self.count = 1
		if name in RCR_POWERS:
			self.rcr = rcr
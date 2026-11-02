# Dev Log
Using this space to track dev notes in a way that is visible within the repo instead of an external note taking app.

## Note 1: November 1st, 2026 (NYC Marathon)
I want to get back into Quadradius and finish a working version of the game, at least with the powers that already exist in the original game.
To that end, we need to build out more than what currently exists, which is just Raise Tile. Adding Lower Tile seems easy enough.
Another thought - we can limit the generated powers to what only has been implemented so far.

So, what else do we need to build? Elevation change powers should be trivial at this point, but some things I imagine will be troublesome.
- animated powers like Relocate, Bombs, Snake Tunneling, Orbic Rehash. timing based animations with CSS keyframes idk or just like setTimeout
- powers that modify tori will require new SVGs for each modification. Inhibit, Grow Q, Parasite, Jump Proof, Climb Tile, Flat2Sphere, Centerpult, Scavenger, Network Bridge, etc.
- powers that modify tiles will require new SVGs. Acidic, Bankrupt, Orb Spy, etc
- there may be some trickiness involved with hidden information powers like Orb Spy, Spyware, Invisible
- we also need to prohibit player input while animations are going on.

This is all future-minded but not too far off. Let's start with Lower, Plateau, Moat, Trench, Wall, and then pick one bullet to build out next.

Where do we make this change to build out power logic? 
Well, the back end game logic starts in the SocketHandlers, so it would start in [`QuadHandler.py`](../src/backend/handlers/quadHandler.py). But we are going to have a massive match-case statement so it might make sense to have some sort of `String`->function mapping there instead with all the logic in a separate file.
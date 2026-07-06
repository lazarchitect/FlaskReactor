
import json
import random
from datetime import datetime

from src.backend.utils import generateId


def newQuadradiusGame(player1, player2, player1_color, player2_color, active_player) -> dict:

    boardstate = json.loads(open('resources/initialQuadLayout.json', 'r').read())
    populatePlayerColors(boardstate, player1_color, player2_color)

    return {
        "player1": player1,
        "player2": player2,
        "player1_color": player1_color,
        "player2_color": player2_color,
        "active_player": active_player,
        "id": generateId(),
        "boardstate": boardstate,
        "completed": False,
        "time_started": datetime.now(),
        "last_move": None, # I believe we don't need to call out the defaults here
        "time_ended": None,
        "winner": None,
        "turn_number": 0,
        "orb_countdown": random.choice([2,4,8]),
        "player1_powers": {},
        "player2_powers": {}
    }
    
def populatePlayerColors(boardstate, player1_color, player2_color):
    for row in range(0, 2):
        for col in range (0, 10):
            boardstate[row][col]['torus']['color'] = player1_color

    for row in range(6, 8):
        for col in range (0, 10):
            boardstate[row][col]['torus']['color'] = player2_color
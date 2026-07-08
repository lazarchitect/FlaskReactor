
import json
import random
from datetime import datetime

from psycopg.types.json import Json

from src.backend.pgdb import getPgdb
from src.backend.utils import generateId


def createQuadGame(player_name, opponent_name):

    pgdb = getPgdb()

    playerColorPrefs = pgdb.getPreferredTorusColors(player_name)
    opponentColorPrefs = pgdb.getPreferredTorusColors(opponent_name)

    if playerColorPrefs['quad_color_pref'] != opponentColorPrefs['quad_color_pref']:
        player_color = playerColorPrefs['quad_color_pref']
        opponent_color = opponentColorPrefs['quad_color_pref']
    else:
        if random.choice(["Heads", "Tails"]) == "Heads":
            player_color = playerColorPrefs['quad_color_pref']
            opponent_color = opponentColorPrefs['quad_color_backup']
        else:
            player_color = playerColorPrefs['quad_color_backup']
            opponent_color = opponentColorPrefs['quad_color_pref']

    players = [[player_name, player_color], [opponent_name, opponent_color]]
    random.shuffle(players)

    game = newQuadGame(
        player1=players[0][0],
        player2=players[1][0],
        player1_color=players[0][1],
        player2_color=players[1][1],
        active_player=players[0][0])

    pgdb.createQuadradiusGame(game)

def newQuadGame(player1, player2, player1_color, player2_color, active_player) -> dict:

    boardstate = json.loads(open('resources/initialQuadLayout.json', 'r').read())
    populatePlayerColors(boardstate, player1_color, player2_color)

    return {
        "player1": player1,
        "player2": player2,
        "player1_color": player1_color,
        "player2_color": player2_color,
        "active_player": active_player,
        "id": generateId(),
        "boardstate": Json(boardstate),
        "time_started": datetime.now(),
        "orb_countdown": random.choice([2,4,8])
    }

def populatePlayerColors(boardstate, player1_color, player2_color):
    for row in range(0, 2):
        for col in range (0, 10):
            boardstate[row][col]['torus']['color'] = player1_color

    for row in range(6, 8):
        for col in range (0, 10):
            boardstate[row][col]['torus']['color'] = player2_color

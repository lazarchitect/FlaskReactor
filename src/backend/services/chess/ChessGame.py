import json
import random
from datetime import datetime

from psycopg.types.json import Json

from src.backend.pgdb import getPgdb
from src.backend.utils import generateId


def createChessGame(player_name, opponent_name):

    pgdb = getPgdb()

    if random.choice(["Heads", "Tails"]) == "Heads":
        white_player = player_name
        black_player = opponent_name

    else:
        white_player = opponent_name
        black_player = player_name

    game = newChessGame(white_player, black_player)

    pgdb.createChessGame(game)

def newChessGame(white_player, black_player):
    boardstate = json.loads(open('resources/initialChessLayout.json', 'r').read())
    return {
        "white_player": white_player,
        "black_player": black_player,
        "id": generateId(),
        "boardstate": Json(boardstate),
        "active_player": white_player,
        "time_started": datetime.now()
        # remaining fields have DB defaults or are nullable
    }
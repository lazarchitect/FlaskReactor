import random

from src.backend.pgdb import getPgdb
from src.backend.utils import generateId

pgdb = getPgdb()

def createTttGame(player_name, opponent_name):

    if random.choice(["Heads", "Tails"]) == "Heads":
        x_player = player_name
        o_player = opponent_name
    else:
        o_player = player_name
        x_player = opponent_name

    game = newTttGame(x_player, o_player)

    getPgdb().createTttGame(game)

def newTttGame(x_player, o_player):

    return {
        "x_player": x_player,
        "o_player": o_player,
        "boardstate": ['','','','','','','','',''],
        "id": generateId(),
        "active_player": random.choice([x_player, o_player])
    }
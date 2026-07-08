import random

from src.backend.utils import generateId


def newTttGame(x_player, o_player):

    return {
        "x_player": x_player,
        "o_player": o_player,
        "boardstate": ['','','','','','','','',''], # 9 empty strings
        "id": generateId(),
        "active_player": random.choice([x_player, o_player])
    }
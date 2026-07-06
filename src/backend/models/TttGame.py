import random
from datetime import datetime

from src.backend.utils import generateId


def newTttGame(x_player, o_player):

    return {
        "x_player": x_player,
        "o_player": o_player,
        "boardstate": ['','','','','','','','',''], # 9 empty strings
        "id": generateId(),
        "completed": False,
        "time_started": datetime.now(),
        "last_move": None,
        "time_ended": None,
        "active_player": random.choice([x_player, o_player]),
        "winner": None
    }
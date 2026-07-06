
import json
from datetime import datetime

from src.backend.utils import generateId


def newChessGame(white_player, black_player):
    return {
        "white_player": white_player,
        "black_player": black_player,
        "id": generateId(),
        "boardstate": json.loads(open('resources/initialChessLayout.json', 'r').read()),
        "active_player": white_player,
        "completed": False,
        "time_started": datetime.now(),

        # dont need to mention defaults, right?
        "last_move": None,
        "time_ended": None,
        "winner": None,
        "notation": "",
        "whitekingmoved": False,
        "blackkingmoved": False,
        "wqr_moved": False,
        "wkr_moved": False,
        "bqr_moved": False,
        "bkr_moved": False,
        "pawn_leapt": False,
        "pawn_leap_col": None
    }

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
        "time_started": datetime.now()
        # remaining fields have DB defaults or are nullable
    }
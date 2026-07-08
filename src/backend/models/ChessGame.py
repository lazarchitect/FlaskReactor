
import json
from datetime import datetime

from psycopg.types.json import Json

from src.backend.utils import generateId


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
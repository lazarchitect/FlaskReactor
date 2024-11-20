import src.utils
import json
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


class ChessGame:
    """Python object representing a specific chess game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg2 returns, and can be converted back to a database record easily."""
    
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(white_player, black_player):
        """constructor for creation from user-input values."""
        g = ChessGame()
        g.id = utils.generateId()
        g.white_player = white_player
        g.black_player = black_player
        g.boardstate = json.loads(open('resources/initialLayout.json', 'r').read())
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        g.player_turn = white_player
        g.winner = None
        return g

    @staticmethod
    def dbLoad(record):
        """constructor for loading from PGDB. field names match db column names exactly."""
        g = ChessGame()
        g.id = record[0]
        g.white_player = record[1]
        g.black_player = record[2]
        g.boardstate = record[3]
        g.completed = record[4]
        g.time_started = record[5]
        g.last_move = record[6]
        g.time_ended = record[7]
        g.player_turn = record[8]
        g.winner = record[9]
        g.notation = record[10]
        g.whitekingmoved = record[11]
        g.blackkingmoved = record[12]
        g.wqr_moved = record[13]
        g.wkr_moved = record[14]
        g.bqr_moved = record[15]
        g.bkr_moved = record[16]
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            UUID_adapter(self.id), 
            self.white_player, 
            self.black_player, 
            Json(self.boardstate),
            self.completed, 
            self.time_started, 
            self.last_move, 
            self.time_ended,
            self.player_turn,
            self.winner
        )

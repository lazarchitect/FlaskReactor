
import json
from datetime import datetime
from src.utils import generateId
from psycopg.types.json import Json


class ChessGame:
    """Python object representing a specific chess game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg2 returns, and can be converted back to a database record easily."""
    
    def __init__(self):
        pass

    # TODO why use this method instead of the constructor?
    @staticmethod
    def manualCreate(white_player, black_player):
        """constructor for creation from user-input values."""
        g = ChessGame()
        g.id = generateId()
        g.white_player = white_player
        g.black_player = black_player
        g.boardstate = json.loads(open('resources/initialChessLayout.json', 'r').read())
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        g.player_turn = white_player
        g.winner = None
        g.notation = ""
        g.whitekingmoved = False
        g.blackkingmoved = False
        g.wqr_moved = False
        g.wkr_moved = False
        g.bqr_moved = False
        g.bkr_moved = False
        g.pawn_leapt = False
        g.pawn_leap_col = -1
        return g

    @staticmethod
    def dbLoad(record):
        """constructor for loading from PGDB. field names match db column names exactly."""
        g = ChessGame()
        g.id = record['id']
        g.white_player = record['white_player']
        g.black_player = record['black_player']
        g.boardstate = record['boardstate']
        g.completed = record['completed']
        g.time_started = record['time_started']
        g.last_move = record['last_move']
        g.time_ended = record['time_ended']
        g.player_turn = record['player_turn']
        g.winner = record['winner']
        g.notation = record['notation']
        g.whitekingmoved = record['whitekingmoved']
        g.blackkingmoved = record['blackkingmoved']
        g.wqr_moved = record['wqr_moved']
        g.wkr_moved = record['wkr_moved']
        g.bqr_moved = record['bqr_moved']
        g.bkr_moved = record['bkr_moved']
        g.pawn_leapt = record['pawn_leapt']
        g.pawn_leap_col = record['pawn_leap_col']
        return g

    # TODO can we get rid of all the toTuple methods if PGDB supports inserting by __dict__?
    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            self.id, # UUID
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

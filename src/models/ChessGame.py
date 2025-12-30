
import json
from datetime import datetime
from src.utils import generateId
from psycopg.types.json import Json

class ChessGame:
    """Python object representing a specific chess game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg returns, and can be converted back to a database record easily."""
    
    def __init__(self, white_player, black_player, isDbLoad):

        self.white_player = white_player
        self.black_player = black_player
        if (isDbLoad): return

        # else, use defaults
        self.id = generateId()
        self.boardstate = json.loads(open('resources/initialChessLayout.json', 'r').read())
        self.player_turn = white_player # TODO change this to 'g.active_player' here and in DB, do so in TTT as well
        self.completed = False
        self.time_started = datetime.now()
        self.last_move = self.time_started
        self.time_ended = None
        self.winner = None
        self.notation = ""
        self.whitekingmoved = False
        self.blackkingmoved = False
        self.wqr_moved = False
        self.wkr_moved = False
        self.bqr_moved = False
        self.bkr_moved = False
        self.pawn_leapt = False
        self.pawn_leap_col = -1

    @staticmethod
    def dbLoad(gameDict):
        """creator function for loading from a DB record. Dict keys match db column names exactly."""
        g = ChessGame(gameDict['white_player'], gameDict['black_player'], isDbLoad=True)
        g.id = gameDict['id']
        g.boardstate = gameDict['boardstate']
        g.completed = gameDict['completed']
        g.time_started = gameDict['time_started']
        g.last_move = gameDict['last_move']
        g.time_ended = gameDict['time_ended']
        g.player_turn = gameDict['player_turn'] # subject to change to 'active_player'
        g.winner = gameDict['winner']
        g.notation = gameDict['notation']
        g.whitekingmoved = gameDict['whitekingmoved']
        g.blackkingmoved = gameDict['blackkingmoved']
        g.wqr_moved = gameDict['wqr_moved']
        g.wkr_moved = gameDict['wkr_moved']
        g.bqr_moved = gameDict['bqr_moved']
        g.bkr_moved = gameDict['bkr_moved']
        g.pawn_leapt = gameDict['pawn_leapt']
        g.pawn_leap_col = gameDict['pawn_leap_col']
        return g

    # TODO can we get rid of all the toTuple methods if psycopg supports inserting by __dict__?
    #  ANSWER - YES, BUT THE INSERT QUERIES NEED TO SPECIFY EACH COLUMN NAME AT THE PLACEHOLDERS.
    #  query = "INSERT INTO schema.table (num, data) VALUES (%(num)s, %(data)s)"
    #  cur.execute(query, my_dict)
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
            # unspecified attributes are initialized to defaults (NULL, FALSE, or -1)
        )

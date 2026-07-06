
import json
from datetime import datetime

from psycopg.types.json import Json

from src.backend.utils import generateId


class ChessGame:
    """Python object representing a specific chess game between two players, with all schema fields that a game record has. """
    
    def __init__(self, white_player, black_player, isDbLoad):

        self.white_player = white_player
        self.black_player = black_player
        if isDbLoad: return

        # else, use defaults
        self.id = generateId()
        self.boardstate = json.loads(open('resources/initialChessLayout.json', 'r').read())
        self.active_player = white_player
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
        g.active_player = gameDict['active_player']
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

    # We could remove these convert methods since psycopg supports inserting by __dict__
    # However, the insert queries need to specify each column name at the placeholders.
    # e.g. query = "INSERT INTO schema.table (num, data) VALUES (%(num)s, %(data)s)"
    # cur.execute(query, my_dict)
    def convertToInsertable(self):
        """creates a database-friendly dict of the object for inserting. Excludes DB defaults."""
        gameDict = vars(self)
        gameDict["boardstate"] = Json(gameDict["boardstate"])
        return gameDict
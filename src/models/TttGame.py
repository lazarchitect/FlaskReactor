import random
from datetime import datetime
from src.utils import generateId


class TttGame:
    """Python object representing a specific Ttt game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg returns, and can be converted back to a database record easily."""
    
    def __init__(self, x_player, o_player, isDbLoad):

        self.x_player = x_player
        self.o_player = o_player
        if isDbLoad: return

        self.id = generateId()
        self.completed = False
        self.time_started = datetime.now()
        self.last_move = self.time_started
        self.time_ended = None
        self.player_turn = random.choice([x_player, o_player]) # move this 'random' logic outside this class
        self.winner = None
        self.boardstate = ['','','','','','','','',''] # 9 empty strings

    @staticmethod
    def dbLoad(gameDict):
        g = TttGame(gameDict['x_player'], gameDict['o_player'], isDbLoad=True)
        g.id = gameDict['id']
        g.completed = gameDict['completed']
        g.time_started = gameDict['time_started']
        g.last_move = gameDict['last_move']
        g.time_ended = gameDict['time_ended']
        g.player_turn = gameDict['player_turn']
        g.winner = gameDict['winner']
        g.boardstate = gameDict['boardstate']
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            self.id,
            self.x_player, 
            self.o_player, 
            self.completed, 
            self.time_started, 
            self.last_move, 
            self.time_ended,
            self.player_turn,
            self.winner,
            self.boardstate
        )

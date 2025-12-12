import random
from datetime import datetime
from src.utils import generateId


class TttGame:
    """Python object representing a specific Ttt game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg2 returns, and can be converted back to a database record easily."""
    
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(x_player, o_player):
        """constructor for creation from user-input values."""
        g = TttGame()
        g.id = generateId()
        g.x_player = x_player
        g.o_player = o_player
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        g.player_turn = random.choice([x_player, o_player]) # move this 'random' logic outside this class
        g.winner = None
        g.boardstate = ['','','','','','','','',''] # 9 empty strings
        return g

    @staticmethod
    def dbLoad(gameDict):
        """constructor for PGDB load"""
        g = TttGame()
        g.id = gameDict['id']
        g.x_player = gameDict['x_player']
        g.o_player = gameDict['o_player']
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

from src.utils import generateId
import random
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


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
        g.boardstate = ['','','','','','','','',''] # 9 empty spaces
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None,
        g.player_turn = random.choice([x_player, o_player])
        g.winner = None
        return g

    @staticmethod
    def dbCreate(record):
        """constructor for PGDB load"""
        g = TttGame()
        g.id = record[0]
        g.x_player = record[1]
        g.o_player = record[2]
        g.completed = record[3]
        g.time_started = record[4]
        g.last_move = record[5]
        g.time_ended = record[6]
        g.player_turn = record[7]
        g.winner = record[8]
        g.boardstate = record[9]
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            UUID_adapter(self.id), 
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

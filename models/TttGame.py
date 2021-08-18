import utils
import json
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


class TttGame:
    """Python object representing a specific Ttt game between two players, with all schema fields that a game record has.
    These are easier to work with than the tuples that psycopg2 returns, and can be converted back to a database record easily."""

    #TODO test all of these functions
    
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(x_player, o_player):
        """constructor for creation from user-input values."""
        g = TttGame()
        g.id = utils.generateId()
        g.x_player = x_player
        g.o_player = o_player
        g.boardstate = ['','','','','','','','',''] # 9 empty spaces
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        return g

    @staticmethod
    def dbCreate(record):
        """constructor for PGDB load"""
        g = TttGame()
        g.id = record[0]
        g.x_player = record[1]
        g.o_player = record[2]
        g.boardstate = record[3]
        g.completed = record[4]
        g.time_started = record[5]
        g.last_move = record[6]
        g.time_ended = record[7]
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            UUID_adapter(self.id), 
            self.x_player, 
            self.o_player, 
            Json(self.boardstate),
            self.completed, 
            self.time_started, 
            self.last_move, 
            self.time_ended
        )

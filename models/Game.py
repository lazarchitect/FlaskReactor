import utils
import json
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


class Game:

    #TODO test all of these functions
    
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(white_player, black_player):
        """constructor for creation from user-input values."""
        g = Game()
        g.id = utils.generateId()
        g.white_player = white_player
        g.black_player = black_player
        g.boardstate = json.loads(open('initialLayout.json', 'r').read())
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        return g

    @staticmethod
    def dbCreate(record):
        """constructor for PGDB load"""
        g = Game()
        g.id = record[0]
        g.white_player = record[1]
        g.black_player = record[2]
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
            self.white_player, 
            self.black_player, 
            Json(self.boardstate),
            self.completed, 
            self.time_started, 
            self.last_move, 
            self.time_ended
        )
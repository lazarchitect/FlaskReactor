from src.utils import generateId
import json
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


class QuadradiusGame:
    def __init__(self):
        pass


    # TODO likely these manualCreate functions are not needed at all, toTuple can just handle directly since it gets called right after
    @staticmethod
    def manualCreate(player1, player2):
        g = QuadradiusGame()
        g.id = generateId()
        g.player1 = player1
        g.player2 = player2
        g.player1_color = "red"
        g.player2_color = "blue"
        g.boardstate = {}
        g.completed = False
        # TODO add more fields like various time stamps, winner, active player, and any other data, add in database as well
        return g

    def dbLoad(record):
        g = QuadradiusGame()
        g.id = record[0]
        g.player1 = record[1]
        g.player2 = record[2]
        g.player1_color = record[3]
        g.player2_color = record[4]
        g.boardstate = record[5]
        g.completed = record[6]
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            UUID_adapter(self.id), 
            self.player1,
            self.player2,
            self.player1_color,
            self.player2_color, 
            Json(self.boardstate), 
            self.completed
        )
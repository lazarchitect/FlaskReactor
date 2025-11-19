from src.utils import generateId
import json
from datetime import datetime
from psycopg2.extras import UUID_adapter, Json


class QuadradiusGame:
    def __init__(self):
        pass


    # TODO likely these manualCreate functions are not needed at all, toTuple can just handle directly since it gets called right after
    @staticmethod
    def manualCreate(player1, player2, player1_color, player2_color):
        g = QuadradiusGame()
        g.id = generateId()
        g.player1 = player1
        g.player2 = player2
        g.player1_color = player1_color
        g.player2_color = player2_color
        g.boardstate = json.loads(open('resources/initialQuadLayout.json', 'r').read())
        g.populatePlayerColors(player1_color, player2_color)
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
    
    def populatePlayerColors(self, player1_color, player2_color):
        for row in range(0, 2):
            for col in range (0, 10):
                self.boardstate[row][col]['torus']['color'] = player1_color

        for row in range(6, 8):
            for col in range (0, 10):
                self.boardstate[row][col]['torus']['color'] = player2_color
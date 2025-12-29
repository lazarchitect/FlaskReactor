
import json
from datetime import datetime

from src.utils import generateId
from psycopg.types.json import Json

class QuadradiusGame:
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(player1, player2, player1_color, player2_color, active_player):
        g = QuadradiusGame()
        g.id = generateId()
        g.player1 = player1
        g.player2 = player2
        g.player1_color = player1_color
        g.player2_color = player2_color
        g.boardstate = json.loads(open('resources/initialQuadLayout.json', 'r').read())
        g.populatePlayerColors(player1_color, player2_color)
        g.active_player = active_player
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = None
        g.time_ended = None
        g.winner = None
        return g

    @staticmethod
    def dbLoad(gameDict):
        g = QuadradiusGame()
        g.id = gameDict['id']
        g.player1 = gameDict['player1']
        g.player2 = gameDict['player2']
        g.player1_color = gameDict['player1_color']
        g.player2_color = gameDict['player2_color']
        g.boardstate = gameDict['boardstate']
        g.active_player = gameDict['active_player']
        g.completed = gameDict['completed']
        g.time_started = gameDict['time_started']
        g.last_move = gameDict['last_move']
        g.time_ended = gameDict['time_ended']
        g.winner = gameDict['winner']
        return g

    def toTuple(self):
        """creates a database-friendly format of the object."""
        return (
            self.id,
            self.player1, self.player2,
            self.player1_color, self.player2_color,
            Json(self.boardstate),
            self.active_player,
            self.completed,
            self.time_started,
            self.last_move,
            self.time_ended,
            self.winner
        )
    
    def populatePlayerColors(self, player1_color, player2_color):
        for row in range(0, 2):
            for col in range (0, 10):
                self.boardstate[row][col]['torus']['color'] = player1_color

        for row in range(6, 8):
            for col in range (0, 10):
                self.boardstate[row][col]['torus']['color'] = player2_color
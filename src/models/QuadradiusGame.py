
import json
from datetime import datetime

from src.utils import generateId
from psycopg.types.json import Json

class QuadradiusGame:
    def __init__(self, player1, player2, player1_color, player2_color, active_player, isDbLoad):

        self.player1 = player1
        self.player2 = player2
        self.player1_color = player1_color
        self.player2_color = player2_color
        self.active_player = active_player
        if isDbLoad: return
        self.id = generateId()
        self.boardstate = json.loads(open('resources/initialQuadLayout.json', 'r').read())
        self.populatePlayerColors(player1_color, player2_color)
        self.completed = False
        self.time_started = datetime.now()
        self.last_move = None
        self.time_ended = None
        self.winner = None

    @staticmethod
    def dbLoad(gameDict):
        g = QuadradiusGame(
            gameDict['player1'],
            gameDict['player2'],
            gameDict['player1_color'],
            gameDict['player2_color'],
            gameDict['active_player'],
            isDbLoad=True)
        g.id = gameDict['id']
        g.boardstate = gameDict['boardstate']
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
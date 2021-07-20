import utils
from datetime import datetime

class Game:

    #TODO test all of these functions
    
    def __init__(self):
        pass


    """constructor for manual creation"""
    def manualCreate(white_player, black_player):
        g = Game()
        g.id = utils.generateId()
        g.white_player = white_player
        g.black_player = black_player
        g.boardstate = open('initialLayout.json', 'r').read()
        g.completed = False
        g.time_started = datetime.now()
        g.last_move = g.time_started
        g.time_ended = None
        return g

    """constructor for PGDB load"""
    def dbCreate(record):
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

    """transforms the object into a database-friendly format"""
    def toTuple(self):
        return (self.id, self.white_player, self.black_player, self.boardstate,
        self.completed, self.time_started, self.last_move, self.time_ended)
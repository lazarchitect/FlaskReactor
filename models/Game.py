import utils, datetime

class Game:

    #TODO test all of these functions
    
    """constructor for manual creation"""
    def __init__(self, white_player, black_player):
        self.id = utils.generateId()
        self.white_player = white_player
        self.black_player = black_player
        self.boardstate = open('initialLayout.json', 'r').read()
        self.prev_moves = ""
        self.status = 0
        self.time_started = datetime.now()
        self.last_move = datetime.now()
        self.time_ended = None

    """constructor for PGDB load"""
    def __init__(self, record):
        self.id = record[0]
        self.white_player = record[1]
        self.black_player = record[2]
        self.boardstate = record[3]
        self.prev_moves = record[4]
        self.status = record[5]
        self.time_started = record[6]
        self.last_move = record[7]
        self.time_ended = record[8]

    """transforms the object into a database-friendly format"""
    def toTuple(self):
        return (self.id, self.white_player, self.black_player, self.boardstate, self.prev_moves,
        self.status, self.time_started, self.last_move, self.time_ended)
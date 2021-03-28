
class Stats:

    """bare minimum"""
    def __init__(self, userId):
        self.userId = userId
        self.games_played = 0
        self.wins = 0
        self.win_percent = 0
        self.played_white = 0
        self.played_black = 0
        self.won_white = 0
        self.won_black = 0


    """pgdb instatiation"""
    def __init__(self, record):
        self.userId = record[0]
        self.games_played = record[1]
        self.wins = record[2]
        self.win_percent = record[3]
        self.played_white = record[4]
        self.played_black = record[5]
        self.won_white = record[6]
        self.won_black = record[7]

    def toTuple(self):
        return (self.userId, self.games_played, self.wins, self.win_percent, 
        self.played_white, self.played_black, self.won_white, self.won_black)
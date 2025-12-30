
# not used anywhere... yet
class Stats:

    def __init__(self, userId, isDbLoad):
        self.userId = userId
        if isDbLoad: return

        self.games_played = 0
        self.wins = 0
        self.win_percent = 0
        self.played_white = 0
        self.played_black = 0
        self.won_white = 0
        self.won_black = 0

    @staticmethod
    def dbLoad(statsDict):
        s = Stats(statsDict['userId'], isDbLoad=True)
        s.games_played = statsDict['games_played']
        s.wins = statsDict['wins']
        s.win_percent = statsDict['win_percent']
        s.played_white = statsDict['played_white']
        s.played_black = statsDict['played_black']
        s.won_white = statsDict['won_white']
        s.won_black = statsDict['won_black']
        return s

    def toTuple(self):
        return (self.userId, self.games_played, self.wins, self.win_percent, 
        self.played_white, self.played_black, self.won_white, self.won_black)
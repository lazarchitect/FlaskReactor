
# not used anywhere... yet
class Stats:

    def __init__(self):
        pass

    @staticmethod
    def manualCreate(userId):
        s = Stats()
        s.userId = userId
        s.games_played = 0
        s.wins = 0
        s.win_percent = 0
        s.played_white = 0
        s.played_black = 0
        s.won_white = 0
        s.won_black = 0
        return s

    @staticmethod
    def dbLoad(statsDict):
        s = Stats()
        s.userId = statsDict['userId']
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
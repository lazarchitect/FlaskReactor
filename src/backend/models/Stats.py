
def newStat(userId):
    return {
        "userId": userId,

        # following are defaults, can likely remove later since DB will use the baked-in defaults. also the columns need "chess_" prefixed on to them
        "games_played": 0,
        "wins": 0,
        "win_percent": 0,
        "played_white": 0,
        "played_black": 0,
        "won_white": 0,
        "won_black": 0
    }
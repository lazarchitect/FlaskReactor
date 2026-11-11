from dataclasses import dataclass
from typing import Callable

from backend.services.quad.quadUtils import determineRcrFunction

@dataclass
class PowerContext:
    """ Data encapsulator used when invoking an arbitrary power function,
    so the logic has access to all relevant fields it might need without repetitive destructuring. """
    row: int
    col: int
    size: int
    tile: dict
    rcrFn: Callable
    activeColor: str
    boardstate: dict
    player1Color: str
    player2Color: str
    player1Powers: dict
    player2Powers: dict

def createPowerContext(power, coords, game):

    size = 1  # growQ will modify this
    row, col = coords['row'], coords['col']
    tile = game.boardstate[row][col]
    activeColor = game.player1_color if game.active_player == game.player1 else game.player2_color
    rcrFn = determineRcrFunction(power.rcr)

    return PowerContext(
        row=row, col=col, size=size, tile=tile, rcrFn=rcrFn,
        activeColor=activeColor, boardstate=game.boardstate,
        player1Color=game.player1_color, player2Color=game.player2_color,
        player1Powers=game.player1_powers, player2Powers=game.player2_powers)
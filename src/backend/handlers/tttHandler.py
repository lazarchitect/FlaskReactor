import json
from datetime import datetime

from src.backend.handlers.AbstractWebSocketHandler import AbstractWebSocketHandler
from src.backend.services.ttt.tttUtils import tttGameOutcome
from src.backend.utils import isEmpty


class TttHandler(AbstractWebSocketHandler):
    # keys are gameIds. values are lists of connection details {socketId, connection} to inform of updates.
    clientConnections = dict()

    def initialize(self):
        super().initialize()
        self.handlerType = "ttt"

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""

        fields = json.loads(message)
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)

        # after subscribing, we should be authenticating
        elif fields.get('ws_token') != self.ws_token:
            self.write_message({
                "command": "error",
                "message": "auth error! invalid ws_token for user"
            })
            return

        elif request == "update":
            self.wsUpdate(fields)

    def wsSubscribe(self, fields: dict):

        if self.socketId is None:
            print('--------------------\nERROR!!! SOCKET ID NOT ASSIGNED\n---------------')

        connectionDetails = {
            "id": self.socketId,
            "conn": self.ws_connection
        }

        # gameId is given to the frontend by Flask in the payload
        gameId = fields.get('gameId')
        if isEmpty(gameId):
            self.write_message({
            "command": "error",
            "message": "server did not receive a game ID from the client",
            "details": str(connectionDetails)
            })
            return
            
        if isEmpty(fields.get('ws_token')):
            self.write_message({
                "command": "info",
                "message": "server did not receive a ws_token from the client",
                "details": str(connectionDetails)
            })
        
        else:
            # used for authentication during updates
            self.ws_token = fields['ws_token']
        
        #used for easy search during later deletion
        self.gameId = gameId

        if gameId not in self.clientConnections:
            self.clientConnections[gameId] = [connectionDetails]
        else:
            self.clientConnections[gameId].append(connectionDetails)

        game = self.pgdb.getTttGame(gameId)

        if game is None:
            self.write_message({
                "command": "error",
                "contents": "game with ID '" + str(gameId) + "' not found in database."
            })

        if game.x_player == game.active_player:
            otherPlayer = game.o_player
        else:
            otherPlayer = game.x_player

        self.write_message({
                "command": "initialize",
                "gameEnded": game.completed,
                "activePlayer": game.active_player,
                "otherPlayer": otherPlayer,
                "winner": game.winner,
                "contents": str(self.socketId) + " subscribed to gameId " + str(gameId)
        })
        

    def wsUpdate(self, fields):
        gameId = fields['gameId']

        # possible bug: can client send a non-castable boardIndex field?
        boardIndex = int(fields['boardIndex'])
        
        
        player = fields['player']
        if player is None:
            #the player is not logged in
            self.write_message({
                "command": "error",
                "contents": "NOT LOGGED IN!?"
            })
            return

        #issue: gameId can be invalid ttt game?
        tttGame = self.pgdb.getTttGame(gameId)

        if player != tttGame.active_player:
            self.write_message({
                "command": "error",
                "contents": "NOT YOUR TURN!"
            })
            return

        if tttGame.x_player == player:
            otherPlayer = tttGame.o_player
            piece = 'X'
        else:
            otherPlayer = tttGame.x_player
            piece = 'O'

        # here, we need to authenticate user currently requesting an update. Session tokens? cookies?

        boardstate = tttGame.boardstate

        if boardstate[boardIndex] != "":
            self.write_message({
                "command": "error",
                "contents": "that tile is occupied!"
            })
            return

        boardstate[boardIndex] = piece
        
        last_updated = datetime.now()

        # active_player has been verified at this point, so now update that column to the OTHER player
        self.pgdb.updateTttGame(boardstate, last_updated, otherPlayer, gameId)

        newActivePlayer = otherPlayer
        oldActivePlayer = player

        messageToSubscribers = {
            "command": "updateBoard",
            "newBoardstate": boardstate,
            "activePlayer": newActivePlayer,
            "otherPlayer": oldActivePlayer
        }

        self.updateAll(gameId, messageToSubscribers)

        gameOutcome = tttGameOutcome(boardstate)

        if gameOutcome is not None:
            winner = oldActivePlayer if gameOutcome == "Win" else None
            self.endTttGame(otherPlayer, winner, gameId)
                
    def endTttGame(self, otherPlayer, winner, gameId):
        messageToSubscribers = {
            "command": "endGame",
            "gameEnded": True,
            "otherPlayer": otherPlayer,
            "winner": winner # None for a tie
        }

        self.updateAll(gameId, messageToSubscribers)

        self.pgdb.endTttGame(datetime.now(), winner, gameId)

        # userId = fields['userId']
        # stat = self.pgdb.getStat(userId)

        # ttt_games_played = stat['ttt_games_played'] + 1
        # ttt_wins = stat['ttt_wins'] + (1 if winner == player else 0)
        # ttt_win_percent = ttt_wins/ttt_games_played
        # ttt_played_x = stat['ttt_played_x'] + (1 if player==tttGame.x_player else 0)
        # ttt_played_o = stat['ttt_played_o'] + (1 if player==tttGame.o_player else 0)
        # ttt_won_x = stat['ttt_won_x'] + (1 if winner == player and player==tttGame.x_player else 0)
        # ttt_won_o = stat['ttt_won_o'] + (1 if winner == player and player==tttGame.o_player else 0)

        # self.pgdb.updateTttStat(
        #     ttt_games_played,
        #     ttt_wins,
        #     ttt_win_percent,
        #     ttt_played_x,
        #     ttt_played_o,
        #     ttt_won_x,
        #     ttt_won_o,
        #     userId)
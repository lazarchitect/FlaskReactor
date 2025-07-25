from datetime import datetime
import src.utils as utils
from src.pgdb import Pgdb
from tornado.websocket import WebSocketHandler
import json

# keys are gameIds. values are lists of WS connections to inform of updates.
clientConnections = dict()

def deleteConnection(gameId, socketId):
    gameConnectionList = clientConnections[gameId]
    for x in gameConnectionList:
        if x['id'] == socketId:
            gameConnectionList.remove(x)
            return

class TttHandler(WebSocketHandler):

    def check_origin(self, origin):
        return True

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env)

    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("tttSocket opened:", str(self.socketId))

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""

        fields = json.loads(message)
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)

        elif request == "update":
            self.wsUpdate(fields)
        
    def on_close(self):
        print("tttSocket closed: " + str(self.socketId))
        
        if not hasattr(self, "gameId"):
            print("tttSocket was not subscribed? not sure why this would happen")
            return
        
        deleteConnection(self.gameId, self.socketId)

    ###############################
    ## Message Handler functions ##
    ###############################

    def wsSubscribe(self, fields):

        if self.socketId == None: 
            print('--------------------\nERROR!!! SOCKETID NOT ASSIGNED\n---------------')

        connectionDetails = {
            "id": self.socketId,
            "conn": self.ws_connection
        }

        # gameId is given to the frontend by Flask in the payload
        try:
            gameId = fields['gameId']
        except KeyError:
            self.write_message({
            "command": "error",
            "message": "server did not receive a game ID from the client",
            "details": str(connectionDetails)
        })
        
        #used for easy search during later deletion
        self.gameId = gameId

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        game = self.pgdb.getTttGame(gameId)

        if game == None:
            self.write_message({
                "command": "error",
                "contents": "game with ID '" + gameId + "' not found in database." 
            })

        if game.x_player == game.player_turn:
            otherPlayer = game.o_player
        else:
            otherPlayer = game.x_player

        self.write_message({
                "command": "info",
                "gameEnded": game.completed,
                "activePlayer": game.player_turn,
                "otherPlayer": otherPlayer,
                "winner": game.winner,
                "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })
        

    def wsUpdate(self, fields):
        gameId = fields['gameId']

        # possible bug: can client send a non-castable boardIndex field?
        boardIndex = int(fields['boardIndex'])
        
        
        player = fields['player']
        if player == None:
            #the player is not logged in
            self.write_message({
                "command": "error",
                "contents": "NOT LOGGED IN YO!! BRUH! WTF?"
            })
            return

        #issue: gameId can be invalid ttt game?
        tttGame = self.pgdb.getTttGame(gameId)

        if player != tttGame.player_turn:
            #uhhh what? the requester is not even the active player?
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

        # 'player' has been verified at this point to match the database record for 'player_turn', 
        # aka the player currently taking a turn.
        # pgdb should update that field to the OTHER player now.
        self.pgdb.updateTttGame(boardstate, last_updated, otherPlayer, gameId)

        newActivePlayer = otherPlayer
        oldActivePlayer = player

        message = {
            "command": "updateBoard",
            "newBoardstate": boardstate,
            "activePlayer": newActivePlayer,
            "otherPlayer": oldActivePlayer
        }

        utils.updateAll(clientConnections[gameId], message)

        gameEnded = utils.tttGameEnded(boardstate)
        winner = oldActivePlayer if (gameEnded == "Win") else None

        if gameEnded:
            self.endTttGame(fields, otherPlayer, winner, gameId, player, tttGame)
                
    def endTttGame(self, fields, otherPlayer, winner, gameId, player, tttGame):
        message = {
            "command": "endGame",
            "gameEnded": True,
            "otherPlayer": otherPlayer,
            "winner": winner # None for a tie
        }

        utils.updateAll(clientConnections[gameId], message)

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
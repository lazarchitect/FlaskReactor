from datetime import datetime
import utils
from pgdb import Pgdb
import tornado.websocket
import json

# keys are gameIds. values are lists of WS connections to inform of updates.
clientConnections = dict()

def deleteConnection(gameId, socketId):
    gameConnectionList = clientConnections[gameId]
    for x in gameConnectionList:
        if x['id'] == socketId:
            gameConnectionList.remove(x)
            return

class Socketeer(tornado.websocket.WebSocketHandler):

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env)
        
    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("WebSocket opened:", str(self.socketId))

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""
        
        fields = json.loads(message)
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)

        elif request == "update":
            self.wsUpdate(fields)
        
    def on_close(self):
        print("WebSocket closed: " + str(self.socketId))
        
        if not hasattr(self, "gameId"):
            print("ws was not subscribed? not sure why this would happen")
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

        gameId = fields['gameId']

        #used for easy search during later deletion
        self.gameId = gameId

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        game = self.pgdb.getTttGame(gameId)

        self.write_message({
                "command": "info",
                "activePlayer": game.player_turn,
                "gameEnded": game.completed,
                "winner": game.winner,
                "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })
        

    def wsUpdate(self, fields):
        gameId = fields['gameId']
        gameType = fields['gameType']


        if gameType == "ttt":

            # possible bug: can client send a non-castable boardIndex field?
            boardIndex = int(fields['boardIndex'])
            
            
            player = fields['player']
            if player == None:
                #huge issue. the player is not logged in. abort!!!
                self.write_message({
                    "command": "error",
                    "contents": "NOT LOGGED IN YO!! BRUH! WTF?"
                })
                return

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
            

            # TODO authenticate user currently requesting an update.

            boardstate = tttGame.boardstate

            # TODO verify that the board at BoardIndex is not occupado

            boardstate[boardIndex] = piece
            
            last_updated = datetime.now()

            # 'player' has been verified at this point to match the database record for 'player_turn', aka the player currently taking a turn.
            # pgdb should update that field to the OTHER player now.
            self.pgdb.updateTttGame(boardstate, last_updated, otherPlayer, gameId)

            # TODO lines 130-140 can be a subroutine with the content dict as input

            for connectionDetails in clientConnections[gameId]:
                try:

                    connectionDetails['conn'].write_message(json.dumps({
                        "command": "updateBoard",
                        "newBoardstate": boardstate,
                        "activePlayer": otherPlayer
                    }))
                
                except tornado.websocket.WebSocketClosedError:
                    print(str(connectionDetails['id']) + " was closed i guess? nvm...")

            gameEnded = utils.tttGameEnded(boardstate)

            if gameEnded:
                for connectionDetails in clientConnections[gameId]:
                    try:
                        connectionDetails['conn'].write_message(json.dumps({
                            "command": "endGame",
                            "outcome": gameEnded,
                            "winner": player if (gameEnded == "Win") else None
                        }))
                    
                    except tornado.websocket.WebSocketClosedError:
                        print(str(connectionDetails['id']) + " was closed i guess? nvm...")

                self.pgdb.endTttGame(datetime.now(), gameId)

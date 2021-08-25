from datetime import datetime
import json
from utils import generateId

from tornado import util
from pgdb import Pgdb
import tornado.websocket

# keys are gameIds. values are lists of WS connections to inform of updates.
clientConnections = dict()

class Socketeer(tornado.websocket.WebSocketHandler):

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env)
        
    def open(self):
        self.socketId = "socket"+ str(generateId())[:8]
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


    def wsSubscribe(self, fields):

        if self.socketId == None: 
            print('--------------------\nERROR!!! SOCKETID NOT ASSIGNED\n---------------')

        connectionDetails = {
            "id": self.socketId,
            "conn": self.ws_connection
        }

        gameId = fields['gameId']
        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)
            
        self.write_message({
                "command": "info",
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
            boardstate[boardIndex] = piece
            
            last_updated = datetime.now()

            # 'player' has been verified at this point to match the database record for 'player_turn', aka the player currently taking a turn.
            # pgdb should update that field to the OTHER player now.
            self.pgdb.updateTttGame(boardstate, last_updated, otherPlayer, gameId)

            # TODO check for game win! will need to review boardstate rows, cols, and diags.
            # if game has ended, tell pgdb to mark the game as completed and write down the time_ended.

            for connectionDetails in clientConnections[gameId]:
                connectionDetails.conn.write_message(json.dumps({
                    "command": "updateBoard",
                    "newBoardstate": boardstate,
                    "activePlayer": otherPlayer
                }))

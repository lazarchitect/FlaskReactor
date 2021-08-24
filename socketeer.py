from datetime import datetime
import json
from pgdb import Pgdb
import tornado.websocket

class Socketeer(tornado.websocket.WebSocketHandler):

    def initialize(self, db_env):
        """
        custom constructor, sets up database connection and dictionary of client connections.
        clientConnections = {gameId1: [conn1, conn2...], gameId2:[conn1, conn2...]...}
        """
        self.pgdb = Pgdb(db_env)
        self.clientConnections = dict()
        
    def open(self):
        """not much use for this function besides debug."""
        print("WebSocket opened:", str(self.ws_connection))

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""
        
        fields = json.loads(message)
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)

        if request == "update":
            self.wsUpdate(fields)
        
    def on_close(self):
        print("WebSocket closed")


    def wsSubscribe(self, fields):
        gameId = fields['gameId']
        if gameId not in self.clientConnections:
            self.clientConnections[gameId] = [self.ws_connection]
        else:
            self.clientConnections[gameId].append(self.ws_connection)
            
        self.write_message({
                "command": "info",
                "contents": str(self.ws_connection) + " subscribed to gameId " + gameId
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

            for conn in self.clientConnections[gameId]:
                conn.write_message(json.dumps({
                    "command": "updateBoard",
                    "newBoardstate": boardstate,
                    "activePlayer": otherPlayer
                }))

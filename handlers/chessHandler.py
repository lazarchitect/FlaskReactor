from pgdb import Pgdb
from FakePgdb import FakePgdb
from tornado.websocket import WebSocketHandler
import json, utils
from datetime import datetime

# keys are gameIds. values are lists of WS connections to inform of updates.
clientConnections = dict()

def deleteConnection(gameId, socketId):
    gameConnectionList = clientConnections[gameId]
    for x in gameConnectionList:
        if x['id'] == socketId:
            gameConnectionList.remove(x)
            return

class ChessHandler(WebSocketHandler):

    def check_origin(self, origin):
        return True

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()

    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("chessSocket opened:", str(self.socketId))

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""

        fields = json.loads(message)
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)

        elif request == "update":
            self.wsUpdate(fields)
        
    def on_close(self):
        print("chessSocket closed: " + str(self.socketId))
        
        if not hasattr(self, "gameId"):
            print("chessSocket was not subscribed? not sure why this would happen")
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

        #TODO error response if gameId is not present
        gameId = fields['gameId']

        #used for easy search during later deletion
        self.gameId = gameId

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        #TODO error response if pgdb doesnt find anything
        game = self.pgdb.getChessGame(gameId)

        if game.white_player == game.player_turn:
            otherPlayer = game.black_player
        else:
            otherPlayer = game.white_player

        self.write_message({
                "command": "info",
                "gameEnded": game.completed,
                "activePlayer": game.player_turn,
                "otherPlayer": otherPlayer,
                "winner": game.winner,
                "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })

    def wsUpdate(self, fields):
        
        gameId = fields["gameId"]
        
        game = self.pgdb.getChessGame(gameId)
        oldBoardstate = game.boardstate

        # TODO VALIDATE MOVE AGAINST EXISTING BOARD 
        # (https://www.notion.so/noshun/Server-side-chess-move-validation-d89dfc680c8849c19b89fbab2a924367)

        # generate new boardstate
        srcTileId = fields["src"]
        destTileId = fields["dest"]

        print("src",srcTileId)
        print("dest",destTileId)

        srcCol, srcRow = (int(srcTileId[0]), int(srcTileId[1]))
        destCol, destRow = (int(destTileId[0]), int(destTileId[1]))

        print("src",srcTileId)
        print("dest",destTileId)

        print("OLD BOARDSTATE")
        utils.printChessboard(oldBoardstate)

        newBoardstate = oldBoardstate

        tempTile = newBoardstate[srcRow][srcCol]
        print(tempTile)
        newBoardstate[srcRow][srcCol] = {}
        newBoardstate[destRow][destCol] = tempTile

        newBoardstate[destRow][destCol] = {"piece": {"row": destRow, "col": destCol, "type": tempTile["piece"]["type"], "color": tempTile["piece"]["color"]}}

        print("NEW BOARDSTATE")
        utils.printChessboard(newBoardstate)

        message = {
            "command": "updateBoard",
            "newBoardstate": newBoardstate
        }

        # TODO handle all clientConnections using utils.updateAll()
        self.write_message(message)

        # TODO update database for persistent moves
        self.pgdb.updateChessBoardstate(newBoardstate, datetime.now(), gameId)
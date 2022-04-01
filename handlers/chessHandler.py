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
        """
        handler for incoming websocket messages.
        expect to see this format: message = {"request": "some_request", "gameId": "whatever", ...}
        """

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

        boardstate = game.boardstate
        
        whiteInCheck = utils.inCheck(boardstate, "Black", utils.getKingCoords(boardstate, "White"))
        blackInCheck = utils.inCheck(boardstate, "White", utils.getKingCoords(boardstate, "Black"))

        self.write_message({
                "command": "info",
                "gameEnded": game.completed,
                "activePlayer": game.player_turn,
                "otherPlayer": otherPlayer,
                "whiteInCheck": whiteInCheck,
                "blackInCheck": blackInCheck,
                "winner": game.winner,
                "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })

    def wsUpdate(self, fields):
        
        gameId = fields["gameId"]
        
        game = self.pgdb.getChessGame(gameId)
        boardstate = game.boardstate


        srcTileId = fields["src"]
        destTileId = fields["dest"]

        srcCol, srcRow = (int(srcTileId[0]), int(srcTileId[1]))
        destCol, destRow = (int(destTileId[0]), int(destTileId[1]))

        srcPiece = boardstate[srcRow][srcCol]["piece"]

        srcType = srcPiece["type"]
        srcColor = srcPiece["color"]

        # TODO VALIDATE MOVE AGAINST EXISTING BOARD 
        # (https://www.notion.so/noshun/Server-side-chess-move-validation-d89dfc680c8849c19b89fbab2a924367)

         
        # execute the move
        boardstate[srcRow][srcCol] = {}
        boardstate[destRow][destCol] = {"piece": {"row": destRow, "col": destCol, "type": srcType, "color": srcColor}}

        newActivePlayer = game.white_player if game.player_turn == game.black_player else game.black_player
        oldActivePlayer = game.white_player if game.player_turn != game.black_player else game.black_player

        allyColor = srcColor
        enemyColor = "Black" if srcColor == "White" else "White"

        allyKingCoords = utils.getKingCoords(boardstate, allyColor)
        enemyKingCoords = utils.getKingCoords(boardstate, enemyColor)

        allyInCheck = utils.inCheck(boardstate, enemyColor, allyKingCoords)
        enemyInCheck= utils.inCheck(boardstate, allyColor, enemyKingCoords)

        whiteInCheck = (allyInCheck and srcColor=="White") or (enemyInCheck and enemyColor=="White")
        blackInCheck = (allyInCheck and srcColor=="Black") or (enemyInCheck and enemyColor=="Black")

        if(allyInCheck):
            # do NOT confirm the move to user or to DB
            self.write_message({
                "command": "error",
                "message": "cannot move into check"
            })
            return
        
        message = {
            "command": "updateBoard",
            "newBoardstate": boardstate,
            "activePlayer": newActivePlayer,
            "otherPlayer": oldActivePlayer,
            "whiteInCheck": whiteInCheck,
            "blackInCheck": blackInCheck
        }

        utils.updateAll(clientConnections[gameId], message)

        self.pgdb.updateChessGame(boardstate, datetime.now(), newActivePlayer, gameId)

        # TODO check if the ENEMY player cannot make any legal moves.
        # if so, its mate.
            # if enemyInCheck == true, 
                # then its checkmate.
            # else, stalemate.
            # convey this info to DB and front end.
            # return
        if utils.noLegalMoves(boardstate, enemyColor):
            winner = oldActivePlayer if enemyInCheck else None
            mate = "Checkmate" if enemyInCheck else "Stalemate"
            message = {
                "command": "endGame",
                "gameEnded": True,
                "otherPlayer": newActivePlayer,
                "winner": winner,
                "mate": mate
            }
            
            utils.updateAll(clientConnections[gameId], message)

            self.pgdb.endChessGame(datetime.now(), winner, gameId)
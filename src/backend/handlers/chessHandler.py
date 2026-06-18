import json
from datetime import datetime

from tornado.websocket import WebSocketHandler

import src.backend.utils as utils
from src.backend.services.chess.Move import Move, executeMove, executeRookJump
from src.backend.services.chess.chessConsts import *
from src.backend.services.chess.mateEvaluator import hasNoLegalMoves

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

    def initialize(self, pgdb):
        self.pgdb = pgdb

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
            self.handleSubscribe(fields)

        # on requests other than subscribe, we should be authenticating
        elif fields.get('ws_token') != self.ws_token:
            self.write_message({
                "command": "error",
                "message": "auth error! invalid ws_token for user"
            })
            return

        elif request == "update":
            self.handleUpdate(fields)

    def on_close(self):
        print("chessSocket closed: " + str(self.socketId))

        if not hasattr(self, "gameId"):
            print("chessSocket was not subscribed? not sure why this would happen")
            return

        deleteConnection(self.gameId, self.socketId)

    ###############################
    ## Message Handler functions ##
    ###############################

    def handleSubscribe(self, fields: dict):

        if self.socketId is None:
            print('--------------------\nERROR!!! SOCKET ID NOT ASSIGNED\n---------------')

        connectionDetails = {
            "id": self.socketId,
            "conn": self.ws_connection
        }

        # gameId is given to the frontend by Flask in the payload and then sent back here to confirm
        gameId = str(fields.get('gameId'))
        if utils.isEmpty(gameId):
            self.write_message({
                "command": "error",
                "message": "server did not receive a game ID from the client",
                "details": str(connectionDetails)
            })
            return
        
        if utils.isEmpty(fields.get('ws_token')):
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

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        game = self.pgdb.getChessGame(gameId)

        if game is None:
            pass
            #TODO If game is None, we should error alert the UI and halt here

        if game.white_player == game.active_player:
            otherPlayer = game.black_player
        else:
            otherPlayer = game.white_player

        boardstate = game.boardstate
        
        whiteInCheck = utils.inCheck(boardstate, "Black", utils.getKingCoords(boardstate, "White"))
        blackInCheck = utils.inCheck(boardstate, "White", utils.getKingCoords(boardstate, "Black"))

        blackKingMoved = game.blackkingmoved
        whiteKingMoved = game.whitekingmoved
        bqrMoved = game.bqr_moved
        bkrMoved = game.bkr_moved
        wqrMoved = game.wqr_moved
        wkrMoved = game.wkr_moved

        self.write_message({
            "command": "info",
            "gameEnded": game.completed,
            "whiteInCheck": whiteInCheck,
            "blackInCheck": blackInCheck,
            "winner": game.winner,
            "gameDetails": {
                "activePlayer": game.active_player, "otherPlayer": otherPlayer,
                "whitekingmoved": whiteKingMoved, "blackkingmoved": blackKingMoved,
                "bqr_moved": bqrMoved, "bkr_moved": bkrMoved, "wqr_moved": wqrMoved, "wkr_moved": wkrMoved
            },
            "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })

    def handleUpdate(self, fields):
        
        gameId = fields["gameId"]
        
        game = self.pgdb.getChessGame(gameId)
        boardstate = game.boardstate


        srcTileId = fields["src"]
        destTileId = fields["dest"]

        srcRow, srcCol = (int(srcTileId[0]), int(srcTileId[1]))
        destRow, destCol = (int(destTileId[0]), int(destTileId[1]))

        srcPiece = boardstate[srcRow][srcCol]["piece"]

        srcType = srcPiece["type"]
        srcColor = srcPiece["color"]
        srcId = srcPiece["id"]

        # tracks if the Kings and Rooks have ever moved, for castling purposes
        blackKingMoved = srcId == "bk" or game.blackkingmoved
        whiteKingMoved = srcId == "wk" or game.whitekingmoved
        bqrMoved = srcId == "bqr" or game.bqr_moved
        bkrMoved = srcId == "bkr" or game.bkr_moved
        wqrMoved = srcId == "wqr" or game.wqr_moved
        wkrMoved = srcId == "wkr" or game.wkr_moved

        # non-mvp work: VALIDATE MOVE AGAINST EXISTING BOARD

        moveNotation = utils.numberToLetter(srcCol) + str(8 - srcRow) + utils.numberToLetter(destCol) + str(8 - destRow) + "."
        if game.notation is None:
            game.notation = ""

        move = Move(srcTileId, destTileId, srcPiece)

        executeMove(boardstate, srcTileId, destTileId)

        if move.type == MoveType.CASTLE:
            executeRookJump(boardstate, move)
            moveNotation = "O-O" if move.side == MoveSide.KINGSIDE else "O-O-O"

        newNotation = game.notation + moveNotation

        newActivePlayer = game.white_player if game.active_player == game.black_player else game.black_player
        oldActivePlayer = game.white_player if game.active_player != game.black_player else game.black_player

        allyColor = srcColor
        enemyColor = "Black" if srcColor == "White" else "White"

        allyKingCoords = utils.getKingCoords(boardstate, allyColor) # king coords can be found within inCheck, dont need those values out here
        enemyKingCoords = utils.getKingCoords(boardstate, enemyColor)

        allyInCheck = utils.inCheck(boardstate, enemyColor, allyKingCoords)
        enemyInCheck= utils.inCheck(boardstate, allyColor, enemyKingCoords)

        whiteInCheck = (allyInCheck and srcColor=="White") or (enemyInCheck and enemyColor=="White")
        blackInCheck = (allyInCheck and srcColor=="Black") or (enemyInCheck and enemyColor=="Black")

        # TODO test this as part of en passant logic
        pawnLeapt = (srcType == "Pawn") and (abs(srcRow - destRow) == 2)
        pawnLeapCol = int(srcCol) if pawnLeapt else -1

        if allyInCheck:
            # do NOT confirm the move to user or to DB
            self.write_message({
                "command": "error",
                "message": "cannot move into check"
            })
            return

        messageToSubscribers = {
            "command": "updateBoard",
            "newBoardstate": boardstate,

            # TODO: following fields could be wrapped up into gameDetails
            "whiteInCheck": whiteInCheck,
            "blackInCheck": blackInCheck,
            "pawnLeapt": pawnLeapt,
            "pawnLeapCol": pawnLeapCol,

            "gameDetails": {
                "activePlayer": newActivePlayer, "otherPlayer": oldActivePlayer,
                "whitekingmoved": whiteKingMoved, "blackkingmoved": blackKingMoved,
                "bqr_moved": bqrMoved, "bkr_moved": bkrMoved, "wqr_moved": wqrMoved, "wkr_moved": wkrMoved
            }
        }

        utils.updateAll(clientConnections[gameId], messageToSubscribers)

        self.pgdb.updateChessGame(
            boardstate,
            datetime.now(),
            newActivePlayer, newNotation,
            blackKingMoved, whiteKingMoved,
            bqrMoved, bkrMoved, wqrMoved, wkrMoved,
            pawnLeapt, pawnLeapCol,
            gameId)

        # related to issues #81 and #82
        # check if the ENEMY player cannot make any legal moves.
        # if so, its mate.
            # if enemyInCheck == true,
                # then its checkmate.
            # else, stalemate.
            # convey this info to DB and front end.
            # return
        if hasNoLegalMoves(boardstate, enemyColor):
            winner = oldActivePlayer if enemyInCheck else None
            mate = "Checkmate" if enemyInCheck else "Stalemate"
            messageToSubscribers = {
                "command": "endGame",
                "gameEnded": True,
                "otherPlayer": newActivePlayer,
                "winner": winner,
                "mate": mate
            }
            
            utils.updateAll(clientConnections[gameId], messageToSubscribers)

            self.pgdb.endChessGame(datetime.now(), winner, gameId)
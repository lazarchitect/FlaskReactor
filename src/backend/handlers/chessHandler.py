import json
from datetime import datetime

from src.backend.handlers.AbstractWebSocketHandler import AbstractWebSocketHandler
from src.backend.services.chess.Move import Move, executeMove, executeRookJump, deletePiece, promotePawn
from src.backend.services.chess.chessConsts import *
from src.backend.services.chess.chessUtils import inCheck, numberToLetter, pieceLetter
from src.backend.services.chess.mateEvaluator import hasNoLegalMoves
from src.backend.utils import isEmpty


class ChessHandler(AbstractWebSocketHandler):

    # keys are gameIds. values are lists of connection details {socketId, connection} to inform of updates.
    clientConnections = dict()

    def initialize(self):
        super().initialize()
        self.handlerType = "chess"

    def on_message(self, message):
        """ Logic for handling incoming websocket messages. Expect to see the following format:
        message = {"request": "some_request", "gameId": "whatever", ...} """

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

        elif request == "resign":
            self.handleResign(fields)

    def handleSubscribe(self, fields: dict):

        if self.socketId is None:
            print('--------------------\nERROR!!! SOCKET ID NOT ASSIGNED\n---------------')

        connectionDetails = {
            "id": self.socketId,
            "conn": self.ws_connection
        }

        # gameId is given to the frontend by Flask in the payload and then sent back here to confirm
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
            self.ws_token = fields['ws_token'] # used for authentication during updates

        self.gameId = gameId # used for easy search during later deletion

        if gameId not in self.clientConnections:
            self.clientConnections[gameId] = [connectionDetails]
        else:
            self.clientConnections[gameId].append(connectionDetails)

        game = self.pgdb.getChessGame(gameId)

        if game is None:
            self.write_message({
                "command": "error",
                "message": "game not found on server during connection handshake"
            })

        if game.white_player == game.active_player:
            otherPlayer = game.black_player
        else:
            otherPlayer = game.white_player

        boardstate = game.boardstate
        
        whiteInCheck = inCheck(boardstate, "Black")
        blackInCheck = inCheck(boardstate, "White")

        blackKingMoved = game.blackkingmoved
        whiteKingMoved = game.whitekingmoved
        bqrMoved = game.bqr_moved
        bkrMoved = game.bkr_moved
        wqrMoved = game.wqr_moved
        wkrMoved = game.wkr_moved

        self.write_message({
            "command": "initialize",
            "gameEnded": game.completed,
            "whiteInCheck": whiteInCheck,
            "blackInCheck": blackInCheck,
            "winner": game.winner,
            "gameDetails": {
                "activePlayer": game.active_player, "otherPlayer": otherPlayer,
                "whitekingmoved": whiteKingMoved, "blackkingmoved": blackKingMoved,
                "bqr_moved": bqrMoved, "bkr_moved": bkrMoved, "wqr_moved": wqrMoved, "wkr_moved": wkrMoved,
                "pawn_leapt": game.pawn_leapt, "pawn_leap_col": game.pawn_leap_col
            },
            "contents": str(self.socketId) + " subscribed to gameId " + str(gameId)
        })

    def handleUpdate(self, fields):
        
        gameId = fields["gameId"]

        isPromotion = True if fields.get("promotion") else False
        promotionChoice = fields.get("typeChoice") if isPromotion else None

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

        moveNotation = numberToLetter(srcCol) + str(8 - srcRow) + numberToLetter(destCol) + str(8 - destRow) + "."
        if game.notation is None:
            game.notation = ""

        move = Move(srcTileId, destTileId, srcPiece, game.pawn_leapt, game.pawn_leap_col, isPromotion, promotionChoice)

        executeMove(boardstate, srcTileId, destTileId)

        if move.isPromotion():
            promotePawn(boardstate, move)
            moveNotation += pieceLetter(promotionChoice)

        if move.isCastling():
            executeRookJump(boardstate, move)
            moveNotation = "O-O" if move.side == MoveSide.KINGSIDE else "O-O-O"

        if move.isEnPassant():
            passedPieceTileId = str(srcRow) + str(game.pawn_leap_col)
            deletePiece(boardstate, passedPieceTileId)

        newNotation = game.notation + moveNotation

        newActivePlayer = game.white_player if game.active_player == game.black_player else game.black_player
        oldActivePlayer = game.white_player if game.active_player != game.black_player else game.black_player

        allyColor = srcColor
        enemyColor = "Black" if srcColor == "White" else "White"

        allyInCheck = inCheck(boardstate, allyColor)
        enemyInCheck= inCheck(boardstate, enemyColor)

        whiteInCheck = (allyInCheck and srcColor=="White") or (enemyInCheck and enemyColor=="White")
        blackInCheck = (allyInCheck and srcColor=="Black") or (enemyInCheck and enemyColor=="Black")

        newPawnLeapt = (srcType == PAWN) and (abs(srcRow - destRow) == 2)
        newPawnLeapCol = int(srcCol) if newPawnLeapt else -1

        if allyInCheck:
            # do NOT confirm the move to user or to DB. Note - this shouldn't happen if messages are sent correctly, just a failsafe
            self.write_message({
                "command": "error",
                "message": "cannot move into check"
            })
            return

        if hasNoLegalMoves(boardstate, enemyColor):
            mate = "Checkmate" if enemyInCheck else "Stalemate"
            winner = oldActivePlayer if enemyInCheck else None
            loser = newActivePlayer if enemyInCheck else None
            messageToSubscribers = {
                "command": "endGame",
                "newBoardstate": boardstate,
                "gameDetails": {"activePlayer": None},
                "gameEnded": True,
                "mate": mate,
                "winner": winner,
                "loser": loser
            }

            self.updateAll(gameId, messageToSubscribers)

            self.pgdb.endChessGame(boardstate, datetime.now(), winner, gameId)

        else:

            messageToSubscribers = {
                "command": "updateBoard",
                "newBoardstate": boardstate,
                "whiteInCheck": whiteInCheck,
                "blackInCheck": blackInCheck,

                "gameDetails": {
                    "activePlayer": newActivePlayer, "otherPlayer": oldActivePlayer,
                    "whitekingmoved": whiteKingMoved, "blackkingmoved": blackKingMoved,
                    "bqr_moved": bqrMoved, "bkr_moved": bkrMoved, "wqr_moved": wqrMoved, "wkr_moved": wkrMoved,
                    "pawn_leapt": newPawnLeapt, "pawn_leap_col": newPawnLeapCol
                }
            }

            self.updateAll(gameId, messageToSubscribers)

            self.pgdb.updateChessGame(
                boardstate,
                datetime.now(),
                newActivePlayer, newNotation,
                blackKingMoved, whiteKingMoved,
                bqrMoved, bkrMoved, wqrMoved, wkrMoved,
                newPawnLeapt, newPawnLeapCol,
                gameId)

    def handleResign(self, fields):
        gameId = fields['gameId']
        resigner = fields['player']
        game = self.pgdb.getChessGame(gameId)
        winner = game.white_player if resigner == game.black_player else game.black_player
        messageToSubscribers = {
            "command": "endGame",
            "newBoardstate": game.boardstate,
            "gameDetails": {"activePlayer": None},
            "gameEnded": True,
            "mate": "Checkmate",
            "winner": winner,
            "loser": resigner
        }

        self.updateAll(gameId, messageToSubscribers)

        self.pgdb.endChessGame(game.boardstate, datetime.now(), winner, gameId)
from tornado.websocket import WebSocketHandler
import json
from src.models.User import User
import src.utils as utils
from src.pgdb import Pgdb
from flask import session

clientConnections = dict()

def deleteConnection(gameId, socketId):
    gameConnectionList = clientConnections[gameId]
    for x in gameConnectionList:
        if x['id'] == socketId:
            gameConnectionList.remove(x)
            return

class ChatHandler(WebSocketHandler):

    # this is required because Flask/Tornado will reject unspecified
    # connections as Forbidden unless we allow it explicitly    
    def check_origin(self, origin):
        return True

    def initialize(self, pgdb):
        self.pgdb = pgdb
    
    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("messageSocket opened:", str(self.socketId))

    def on_message(self, message):

        fields = json.loads(message) # message structure comes in as JSON from frontend
        request = fields['request']

        if request == "subscribe":
            self.handleSubscribe(fields)
        
        # after subscribing, we should be authenticating
        elif hasattr(self, "ws_token") == False or fields.get('ws_token') != self.ws_token:
            self.write_message({
                "command": "error",
                "message": "auth error! invalid ws_token for user"
            })
            return

        elif request == "update":
            self.handleUpdate(fields)

    def on_close(self):
        print("WebSocket closed")

    def handleUpdate(self, fields):

        print(fields)
        
        index = 0 # doesnt matter, but we could set it to max(indexes so far)
        username = fields['username']
        content = fields['content']

        responseToClient = {
            "command": "append",
            "chat": {"index": index, "username": username, "content": content}
        }

        gameId = fields['gameId']

        utils.updateAll(clientConnections[fields['gameId']], responseToClient)
            
        self.pgdb.createChat(gameId, fields['content'], fields['username'])


    def handleSubscribe(self, fields: dict):

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
            return

        #used for easy search during later deletion
        self.gameId = gameId

        if utils.hasNoContent(fields.get('ws_token')):
            self.write_message({
                "command": "info",
                "message": "server did not receive a ws_token from the client",
                "details": str(connectionDetails)
            })
            return #non-logged in viewers should not have chat log access. 

        # non-players should not have chat log access
        username = fields.get('username', None)
        if utils.hasNoContent(username):
            self.write_message({
                "command": "info",
                "message": "server did not receive a username from the client",
                "details": str(connectionDetails)
            })

        match(fields.get('game_type', None)):
            case "chess":
                game = self.pgdb.getChessGame(gameId)
                if username not in [game.black_player, game.white_player]:
                    print("debug: user is not a player")
                    return # non-players should not have chat log access.
            case "ttt":
                game = self.pgdb.getTttGame(gameId)
                if username not in [game.x_player, game.o_player]:
                    print("debug: user is not a player")
                    return
            case "quadradius":
                game = self.pgdb.getQuadradiusGame(gameId)
                if username not in [game.player1, game.player2]:
                    print("debug: user is not a player")
                    return
            case _:
                print("received game type", fields.get('game_type', None), "invalid or not currently supported for messages")
                return

        # authenticate user by checking if the provided ws_token matches what's in the DB 
        user = self.pgdb.getUser(fields['username']) # possible improvement - let the users recieve and pass back an encrypted string containing their ws_token
        if (fields['ws_token'] != User.dbLoad(user).ws_token):
            print("debug: this user is claiming to have a different WS token? malicious?")
            return #this guy's a phony!

        # used for authentication during updates
        self.ws_token = fields['ws_token']

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        chats = self.pgdb.getChats(gameId)

        self.write_message({
            "command": "info",
            "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })

        self.write_message({
            "command": "initialize",
            "chats": chats
        })
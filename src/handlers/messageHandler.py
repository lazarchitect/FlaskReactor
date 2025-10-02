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

class MessageHandler(WebSocketHandler):

    # this is required because Flask/Tornado will reject unspecified
    # connections as Forbidden unless we allow it explicitly    
    def check_origin(self, origin):
        return True

    def initialize(self):
        self.pgdb = Pgdb()
    
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
        
        index = 0 #  doesnt matter
        username = fields['username']
        message = fields['message']

        responseToClient = {
            "command": "append",
            "chat": [index, username, message]
        }

        gameId = fields['gameId']

        utils.updateAll(clientConnections[fields['gameId']], responseToClient)
            
        self.pgdb.createMessage(gameId, fields['message'], fields['username'])


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
            
 
        # TODO non-players should not have chat log access. We need to validate who the user is as well
        # we can use a pdgb call to get the game based on gameId and see if this user (username in fields) is one of the players
        # we also need to check their ws_token (stored in pgdb users) is correct (this is the magic sauce) 
        match(fields['game_type']):
            case "chess":
                game = self.pgdb.getChessGame(gameId)
                if fields['username'] not in [game.black_player, game.white_player]:
                    print("debug: user is not a player")
                    return # non-players should not have chat log access.
            # TODO: TTT handling
            case _:
                print("game type ", fields['game_type'], "not supported for chat")
                return # invalid game type

        user = self.pgdb.getUser(fields['username'])
        if (fields['ws_token'] != User.dbLoad(user).ws_token):
            print("debug: this user is claiming to have a different WS token? malicious?")
            return #this guy's a phony!

        # used for authentication during updates
        self.ws_token = fields['ws_token']

        if gameId not in clientConnections:
            clientConnections[gameId] = [connectionDetails]
        else:
            clientConnections[gameId].append(connectionDetails)

        messages = self.pgdb.getMessages(gameId)

        self.write_message({
            "command": "info",
            "contents": str(self.socketId) + " subscribed to gameId " + gameId
        })

        self.write_message({
            "command": "initialize",
            "chats": messages
        })
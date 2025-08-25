from tornado.websocket import WebSocketHandler
import json
import src.utils as utils
from src.pgdb import Pgdb
from src.FakePgdb import FakePgdb
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

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()
    
    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("messageSocket opened:", str(self.socketId))

    def on_message(self, message):

        fields = json.loads(message) # message structure comes in as JSON from frontend
        request = fields['request']

        if request == "subscribe":
            self.handleSubscribe(fields)
        
        # after subscribing, we should be authenticating
        elif fields.get('ws_token') != self.ws_token:
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
                "command": "error",
                "message": "server did not receive a ws_token from the client",
                "details": str(connectionDetails)
            })
            return
        
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
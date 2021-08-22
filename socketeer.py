import json
from pgdb import Pgdb
import tornado.websocket

clientConnections = dict() # {}

class Socketeer(tornado.websocket.WebSocketHandler):

    def initialize(self, db_env) -> None:
        self.pgdb = Pgdb(db_env)
        # return super()._initialize()
        pass

    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""
        
        fields = json.loads(message)
        request = fields['request']
        gameId = fields.get('gameId')  #can be null.

        if request == "subscribe":

            if gameId not in clientConnections:
                clientConnections[gameId] = [self.ws_connection]
            else:
                clientConnections[gameId].append(self.ws_connection)
            
            self.write_message(str(self.ws_connection) + " subscribed to gameId " + gameId)

        if request == "update":

            """
            TODO implement: check for all needed fields. 
            if its all kosher, then we update the game AND send the new boardstate to all parties in some kind of well formatted way.
            FOR NOW I WILL ASSUME ITS KOSHER.
            """
            
            # WRITE CODE HERE

            for connection in clientConnections[gameId]:
                try:
                    connection.write_message("the game " + gameId + "has been updated")
                except tornado.websocket.WebSocketClosedError:
                    print("connection " + str(self.ws_connection) + " closed already.")
                    clientConnections[gameId].remove(connection)
        

    def on_close(self):
        print("WebSocket closed")
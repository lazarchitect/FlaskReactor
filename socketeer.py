import json
import tornado.websocket

clientConnections = dict() # {}

class Socketeer(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        """handler for incoming websocket messages. expect to see this format: message = {"request": "subscribe", "gameId": "whatever", ...}"""
        
        fields = json.loads(message)
        request = fields['request']
        gameId = fields['gameId']

        if request == "subscribe":

            if gameId not in clientConnections:
                clientConnections[gameId] = [self.ws_connection]
            else:
                clientConnections[gameId].append(self.ws_connection)
            
            self.write_message(str(self.ws_connection) + " subscribed to gameId " + gameId)

        if request == "update":
            for connection in clientConnections[gameId]:
                try:
                    connection.write_message("the game " + gameId + "has been updated")
                except tornado.websocket.WebSocketClosedError:
                    print("connection " + str(self.ws_connection) + " closed already.")
                    clientConnections[gameId].remove(connection)
        

    def on_close(self):
        print("WebSocket closed")
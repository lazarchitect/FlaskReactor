import tornado.websocket

clientConnections = dict() # {}

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        self.write_message(u"You just said \"" + message + "\"... lmao wtf?")

    def on_close(self):
        print("WebSocket closed")
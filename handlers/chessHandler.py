from tornado.websocket import WebSocketHandler
import json

# TODO needs clientConnections of chess games.

class ChessHandler(WebSocketHandler):
    
    def open(self):
        pass

    def on_message(self, fields):
        pass

    def on_close(self):
        pass
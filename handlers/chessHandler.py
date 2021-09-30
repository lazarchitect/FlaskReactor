from pgdb import Pgdb
from tornado.websocket import WebSocketHandler
import json

# TODO needs clientConnections of chess games.

class ChessHandler(WebSocketHandler):
    
    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env)

    def open(self):
        pass

    def on_message(self, fields):
        pass

    def on_close(self):
        pass
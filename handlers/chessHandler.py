from pgdb import Pgdb
from FakePgdb import FakePgdb
from tornado.websocket import WebSocketHandler
import json

# TODO needs clientConnections of chess games.

class ChessHandler(WebSocketHandler):
    
    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()

    def open(self):
        pass

    def on_message(self, fields):
        print(fields)

    def on_close(self):
        pass
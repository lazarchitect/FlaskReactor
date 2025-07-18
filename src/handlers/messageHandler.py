from tornado.websocket import WebSocketHandler
import json
import src.utils as utils
from src.pgdb import Pgdb
from src.FakePgdb import FakePgdb

class MessageHandler(WebSocketHandler):

    # this is required because Flask (?) will reject unspecified connections as Forbidden
    # unless we allow it explicitly    
    def check_origin(self, origin):
        return True

    def initialize(self, db_env):
        self.pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()
    
    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("messageSocket opened:", str(self.socketId))

    def on_message(self, message):

        fields = json.loads(message); # message structure comes in as JSON from frontend
        request = fields['request']

        if request == "subscribe":
            self.wsSubscribe(fields)
        
        elif request == "update":
            self.wsUpdate(fields)

        # TODO implement server side message handling (insert to pgdb, update all listeners with the new message (just the two players.))
        self.write_message("You said: " + message)

    def on_close(self):
        print("WebSocket closed")
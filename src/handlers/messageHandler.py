from tornado.websocket import WebSocketHandler
import src.utils as utils

class MessageHandler(WebSocketHandler):

    # may need this if having origin issues    
    # def check_origin(self, origin):
    #     return True

    # no idea... probably this gets called by the Tornado endpoint handler mapper instead of __init__
    # def initialize(self, db_env):
    #     self.pgdb = Pgdb(db_env) if db_env != "no_db" else FakePgdb()
    
    def open(self):
        self.socketId = "socket"+ str(utils.generateId())[:8]
        print("messageSocket opened:", str(self.socketId))

    def on_message(self, message):
        self.write_message(u"You said: " + message)

    def on_close(self):
        print("WebSocket closed")
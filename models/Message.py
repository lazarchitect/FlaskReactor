
class Message:
    
    def __init__():
        pass

    @staticmethod
    def manualCreate(gameId, content, index):
        m = Message()
        m.gameId = gameId
        m.index = index
        m.content = content
        return m

    @staticmethod
    def dbCreate(record):
        m = Message()
        m.gameId, m.index, m.content = record
        return m

    def toTuple(self):
        return (self.gameId, self.index, self.content)
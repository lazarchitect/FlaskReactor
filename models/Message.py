
class Message:
    
    def __init__(self, gameId, content, index):
        self.gameId = gameId
        self.content = content
        self.index = index

    def __init__(self, record):
        self.gameId, self.content, self.index = record

    def toTuple(self):
        return (self.gameId, self.content, self.index)
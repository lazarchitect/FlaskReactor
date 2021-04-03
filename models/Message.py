
class Message:
    
    def __init__(self, gameId, content, index):
        self.gameId = gameId
        self.index = index
        self.content = content

    def __init__(self, record):
        self.gameId, self.index, self.content = record

    def toTuple(self):
        return (self.gameId, self.index, self.content)
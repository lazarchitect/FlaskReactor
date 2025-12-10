
# not used anywhere
class Chat:
    
    def __init__(self):
        pass

    @staticmethod
    def manualCreate(gameId, content, index):
        c = Chat()
        c.gameId = gameId
        c.index = index
        c.content = content
        return c

    @staticmethod
    def dbCreate(chatDict):
        c = Chat()
        c.gameId = chatDict['gameId']
        c.index = chatDict['index']
        c.content = chatDict['content']
        return c

    def toTuple(self):
        return (self.gameId, self.index, self.content)
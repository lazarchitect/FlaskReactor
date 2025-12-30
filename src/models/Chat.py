
# this class is not used
class Chat:
    
    def __init__(self, gameId, content, index):
        self.gameId = gameId
        self.index = index
        self.content = content

    @staticmethod
    def dbLoad(chatDict):
        return Chat(gameId=chatDict['gameId'], index=chatDict['index'], content=chatDict['content'])

    def toTuple(self):
        return (self.gameId, self.index, self.content)
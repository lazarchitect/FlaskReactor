from src.utils import generateId

class User:

    def __init__(self):
        pass

    @staticmethod
    def manualCreate(name, password_hash):
        u = User()
        u.name = name
        u.email = None
        u.userId = generateId()
        u.password_hash = password_hash
        return u

    @staticmethod
    def dbLoad(userDict):
        u = User()
        u.name = userDict['name']
        u.email = userDict['email']
        u.id = userDict['id']
        u.password_hash = userDict['password_hash']
        u.ws_token = userDict['ws_token']
        # TODO quadradius color prefs and other prefs later
        return u
        
    def toTuple(self):
        return (self.name, self.email, self.userId, self.password_hash, self.ws_token)
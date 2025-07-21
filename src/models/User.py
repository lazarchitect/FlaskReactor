from src.utils import generateId

class User:

    def __init__(self):
        pass

    @staticmethod
    def manualCreate(username, password_hash):
        u = User()
        u.username = username
        u.email = None
        u.userId = generateId()
        u.password_hash = password_hash
        return u

    @staticmethod
    def dbCreate(record):
        u = User()
        u.username = record[0]
        u.email = record[1]
        u.userId = record[2]
        u.password_hash = record[3]
        return u
        
    def toTuple(self):
        return (self.username, self.email, self.userId, self.password_hash)
import utils

class User:

    #### TODO UNIT TESTING!!!

    """bare minimum"""
    def __init__(self, username, password_hash):
        self.username = username
        self.email = None
        self.userId = utils.generateId()
        self.password_hash = password_hash

    """pgdb instantiation"""
    def __init__(self, record):
        #TODO verify indices of these fields. does Security_q even exist?
        self.username = record[0]
        self.email = record[1]
        self.userId = record[2]
        self.password_hash = record[3]

    def toTuple(self):
        return (self.username, self.email, self.userId, self.password_hash)
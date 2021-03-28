import utils

class User:

    #### TODO UNIT TESTING!!!

    """bare minimum"""
    def __init__(self, username, password_hash):
        self.username = username
        self.password_hash = password_hash
        self.userId = utils.generateId()
        self.email = None
        self.security_q = None

    """pgdb instantiation"""
    def __init__(self, record):
        #TODO verify indices of these fields. does Security_q even exist?
        self.username = record[0]
        self.email = record[1]
        self.userId = record[2]
        self.password_hash = record[4]
        self.security_q = record[5]

    def toTuple(self):
        return (self.username, self.email, self.userId, self.password_hash, self.security_q)
from src.utils import generateId

class User:

    def __init__(self, name, password_hash, email, ws_token, isDbLoad):
        self.name = name
        self.password_hash = password_hash
        self.email = email
        self.ws_token = ws_token
        if isDbLoad: return

        self.userId = generateId()
        self.quad_color_pref = "red"
        self.quad_color_backup = "blue"

    @staticmethod
    def dbLoad(userDict):
        u = User(userDict['name'], userDict['password_hash'], userDict['email'], userDict['ws_token'], isDbLoad=True)

        u.id = userDict['id']
        u.quad_color_pref = userDict['quad_color_pref']
        u.quad_color_backup = userDict['quad_color_backup']
        # add other prefs here
        return u
        
    def toTuple(self):
        return (
            self.name,
            self.password_hash,
            self.email,
            self.userId,
            self.ws_token,
            self.quad_color_pref,
            self.quad_color_backup)
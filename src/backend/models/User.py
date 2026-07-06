from src.backend.utils import generateId

def newUser(name, password_hash, email, ws_token):
    return {
        "name": name,
        "password_hash": password_hash,
        "email": email,
        "ws_token": ws_token,
        "id": generateId(),

        # following are defaults
        "quad_color_pref": "red",
        "quad_color_backup": "blue",
        "use_chat": True
        # add other pref defaults here
    }
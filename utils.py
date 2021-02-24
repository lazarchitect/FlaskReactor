from uuid import uuid4
from hashlib import sha256

def generateId():
    return str(uuid4())

def generateHash(password):
    return sha256(password.encode('utf8')).hexdigest()

from uuid import uuid4
from hashlib import pbkdf2_hmac

def generateId():
    return str(uuid4())

def generateHash(password):
    hash_bytes = pbkdf2_hmac(
        'sha256', # The hash digest algorithm for HMAC
        password.encode('utf-8'), # Convert the password to bytes
        b'', # f**k salt
        100000) # It is recommended to use at least 100,000 iterations of SHA-256 

    return str(hash_bytes)
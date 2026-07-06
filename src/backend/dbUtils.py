from types import SimpleNamespace

from psycopg.types.json import Json

JSON_COLUMNS = ['boardstate', 'player1_powers', 'player2_powers']

def makeInsertSafe(dbDict):
	for k,v in dbDict.items():
		if k in JSON_COLUMNS:
			dbDict[k] = Json(v)

def convertToObject(gameDict):
	"""Helpful for using dot notation instead of dict key access."""
	return SimpleNamespace(**gameDict)
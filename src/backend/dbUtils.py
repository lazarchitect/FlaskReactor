from types import SimpleNamespace

def convertToObject(gameDict):
	"""Helpful for using dot notation instead of dict key access."""
	return SimpleNamespace(**gameDict)
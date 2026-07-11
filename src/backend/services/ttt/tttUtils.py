
tttTriples = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

def tttGameOutcome(board):
	for triple in tttTriples:
		if isWinner(board[triple[0]], board[triple[1]], board[triple[2]]):
			return "Win"
	if '' not in board:
		return "Tie"
	return None

def isWinner(a, b, c):
	return a == b and b == c and a != ''
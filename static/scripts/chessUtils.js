//chessUtils.js

function isPiece(boardstate, coords, pieceType, pieceColor) {
    if (outOfBounds(coords)) return false;
    const piece = pieceAt(boardstate, coords);
    if (piece == null) return false;
    // TODO DEBUG THIS!
    console.debug(boardstate + " has a " + piece);
    return piece.type == pieceType && piece.color == pieceColor
}

function pieceTowards(boardstate, coords, offset) {
    
}

function inCheck(boardstate, enemyColor, kingCoords) {
    
    // Look for Kings (assuming no safety) 
    royalOffsets.forEach(offset => {
        const targetCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1]);
        if (isPiece(boardstate, targetCoords, "King", enemyColor)) 
            return true;
    });

    // Look for Knights
    knightOffsets.forEach(offset => {
        const targetCoords = (kingCoords[0] + offset[0], kingCoords[1] + offset[1]); 
        if (isPiece(boardstate, targetCoords, "Knight", enemyColor)) 
            return true;
    });

    // Look for Pawns
    // can you == strings? === needed?
    const pawnDirection = enemyColor == "White" ? 1 : -1;
    const pawnLeftCoords = (kingCoords[0] + pawnDirection, kingCoords[1] - 1)
    const pawnRightCoords= (kingCoords[0] + pawnDirection, kingCoords[1] + 1)
    if (isPiece(boardstate, pawnLeftCoords, "Pawn", enemyColor))
        return true;
    if (isPiece(boardstate, pawnRightCoords, "Pawn", enemyColor))
        return true;

    // LOOK FOR ROOKS/QUEENS
    
    rookOffsets.forEach(offset => {
        let piece = pieceTowards(boardstate, kingCoords, offset);
        if (piece != null) { // is null correct here?
            if (pieceMatch(piece, enemyColor, "Rook") || pieceMatch(piece, enemyColor, "Queen")) {
                return true
            }
        } 
    });
        
    // LOOK FOR BISHOPS/QUEENS
    bishopOffsets.forEach(offset => {
        let piece = pieceTowards(boardstate, kingCoords, offset)
        if (piece != null){
            if (pieceMatch(piece, enemyColor, "Bishop") || pieceMatch(piece, enemyColor, "Queen")){
                return true
            }
        }
                

    return false;
    })
}

console.log(inCheck(boardstate, "black", ""))
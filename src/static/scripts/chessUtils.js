// collection of helper functions for front-end logic to support chess gameplay

// returns a Piece Object like Piece{color: "Black", type: "Knight" ....}
function pieceAt(boardstate, coords) {
    let col = parseInt(coords[0]);
    let row = parseInt(coords[1]);
    return boardstate[row][col].piece;
}

function isPiece(boardstate, coords, pieceType, pieceColor) {
    if (outOfBounds(coords)) return false;
    const piece = pieceAt(boardstate, coords);
    if (piece == null) return false;
    // TODO DEBUG THIS!
    console.debug(boardstate + " has a " + piece);
    return piece.type == pieceType && piece.color == pieceColor
}

// recursive fn to scan along a row/col/diag to see if a given piece is in that direction.
function pieceTowards(boardstate, coords, offset) {
    let targetCoords = [coords[0] + offset[0], coords[1] + offset[1]]; 
    // TODO FINISH AS PART OF #78
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
            // TODO FINISH AS PART OF #78
            // if (pieceMatch(piece, enemyColor, "Rook") || pieceMatch(piece, enemyColor, "Queen")) {
            //     return true;
            // }
        } 
    });
        
    // LOOK FOR BISHOPS/QUEENS
    bishopOffsets.forEach(offset => {
        let piece = pieceTowards(boardstate, kingCoords, offset)
        if (piece != null){
            // TODO FINISH AS PART OF #78
            // if (pieceMatch(piece, enemyColor, "Bishop") || pieceMatch(piece, enemyColor, "Queen")){
            //     return true;
            // }
        }
    return false;
    })
}   

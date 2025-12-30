// collection of helper functions for front-end logic to support chess gameplay

import * as chessConsts from './chessConsts';

// returns a Piece Object like Piece{color: "Black", type: "Knight" ....}
export function getPiece(boardstate, coords) {
    let col = parseInt(coords[0]);
    let row = parseInt(coords[1]);
    return boardstate[row][col].piece;
}

export function pieceMatch(piece, pieceColor, pieceType) {
    return piece.color === pieceColor && piece.type === pieceType
}

export function hasPiece(boardstate, coords) { 
   return getPiece(boardstate, coords) != null; 
}

export function outOfBounds(coords) {
    let [row, col] = coords;
    return row < 0 || row > 7 || col < 0 || col > 7;
}

// is a piece at a location the specified type and color?
export function isPiece(boardstate, coords, pieceType, pieceColor) {
    if (outOfBounds(coords)) return false;
    const piece = getPiece(boardstate, coords);
    if (piece == null) return false;
    return piece.type === pieceType && piece.color == pieceColor
}

export function getKingCoords(boardstate, color) {
    for(let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {
            if(isPiece(boardstate, [col, row], 'King', color)) {
                return [row, col]
            }
        }
    }
}

// recursive fn to scan along a row/col/diag to see if a given piece is in that direction.
export function pieceTowards(boardstate, coords, offset) {
    let targetCoords = [coords[0] + offset[0], coords[1] + offset[1]]; 
    if (outOfBounds(targetCoords)) 
        return null;
    if (hasPiece(boardstate, coords)) {
        return getPiece(boardstate, coords);
    }
    return pieceTowards(boardstate, targetCoords, offset);
}

export function inCheck(boardstate, enemyColor, kingCoords) {
    
    // Look for Kings (assuming no safety) 
    chessConsts.ROYAL_OFFSETS.forEach(offset => {
        const targetCoords = [kingCoords[0] + offset[0], kingCoords[1] + offset[1]];
        if (isPiece(boardstate, targetCoords, "King", enemyColor)) 
            return true;
    });

    // Look for Knights
    chessConsts.KNIGHT_OFFSETS.forEach(offset => {
        const targetCoords = [kingCoords[0] + offset[0], kingCoords[1] + offset[1]];
        if (isPiece(boardstate, targetCoords, "Knight", enemyColor)) 
            return true;
    });

    // Look for Pawns
    // can you == strings? === needed?
    const pawnDirection = enemyColor === "White" ? 1 : -1;
    const pawnLeftCoords = [kingCoords[0] + pawnDirection, kingCoords[1] - 1];
    const pawnRightCoords= [kingCoords[0] + pawnDirection, kingCoords[1] + 1];
    if (isPiece(boardstate, pawnLeftCoords, "Pawn", enemyColor))
        return true;
    if (isPiece(boardstate, pawnRightCoords, "Pawn", enemyColor))
        return true;

    // Look orthogonally for Rooks/Queens
    chessConsts.ROOK_OFFSETS.forEach(offset => {
        let piece = pieceTowards(boardstate, kingCoords, offset);
        if (piece != null) { // is null correct here?
            if (pieceMatch(piece, enemyColor, "Rook") || pieceMatch(piece, enemyColor, "Queen")) {
                return true;
            }
        } 
    });
        
    // Look diagonally for Bishops/Queens
    chessConsts.BISHOP_OFFSETS.forEach(offset => {
        let piece = pieceTowards(boardstate, kingCoords, offset)
        if (piece != null) {
            if (pieceMatch(piece, enemyColor, "Bishop") || pieceMatch(piece, enemyColor, "Queen")){
                return true;
            }
        }
    return false;
    })
}   

// generates a deepcopy of the boardstate & moves the piece at src to the tile dest, replacing anything there;
// returns the board copy containing this modification
export function previewModifiedBoard(boardstate, srcCoords, destCoords) {

    let deepcopy = structuredClone(boardstate);

    let srcRow = srcCoords[0];
    let srcCol = srcCoords[1];
    let destRow = destCoords[0];
    let destCol = destCoords[1];

    // gonna be a lot of these
    // console.log("deepCopy: " + JSON.stringify(deepcopy));

    deepcopy[destRow][destCol] = deepcopy[srcRow][srcCol]; // does this  work??

    return deepcopy;


}
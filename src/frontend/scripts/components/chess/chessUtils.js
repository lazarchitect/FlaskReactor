// collection of helper functions for front-end logic to support chess gameplay

import {BISHOP_OFFSETS, KNIGHT_OFFSETS, ROOK_OFFSETS, ROYAL_OFFSETS} from './chessConsts';

class Piece {
    constructor(pieceData) {
        this.color = pieceData.color;
        this.type = pieceData.type;
        this.row = pieceData.row;
        this.col = pieceData.col;
    }
    isAllyOf(otherPiece) {return otherPiece !== undefined && this.color === otherPiece.color;}
    isOpposingColorOf(color) {return this.color === "White" ? color === "Black" : color === "White";}
    is (color, type) {return this.color === color && type === this.type}


}

/** Fetches a piece at a location, if any. Note - we should use the optional chaining operator on the result in most situations.
 *  @param boardstate 2D array with objects representing tiles, and sub-objects for pieces
 *  @param coords can be a string tileId (e.g. "02") or a cartesian pair array (e.g. [0,2])
 *  @return Piece object e.g. Piece{color: "Black", type: "Knight" ....} or undefined for an empty or out-of-bounds tile. */
export function pieceAt(boardstate, coords) {
    if (outOfBounds(coords)) return undefined;
    let row = parseInt(coords[0]);
    let col = parseInt(coords[1]);
    let pieceData = boardstate[row][col]["piece"];
    if (pieceData === undefined) return undefined;
    return new Piece(pieceData);
}

/** Determines if the given move from src to dest would NOT introduce check, or that it would escape any existing check.
    Assumes both coords are within the board. */
export function isSafeMove(boardstate, srcCoords, destCoords) {

    let modifiedBoardstate = previewModifiedBoard(boardstate, srcCoords, destCoords);

    const pieceColor = pieceAt(boardstate, srcCoords)?.color;

    return !inCheck(modifiedBoardstate, pieceColor);

}

function inCheck(boardstate, yourColor) {

    const enemyColor = (yourColor === "Black" ? "White" : "Black");

    const kingCoords = getKingCoords(boardstate, yourColor);

    // Look for Pawns
    const pawnDirection = enemyColor === "White" ? 1 : -1;
    const pawnLeftCoords = [kingCoords[0] + pawnDirection, kingCoords[1] - 1];
    const pawnRightCoords= [kingCoords[0] + pawnDirection, kingCoords[1] + 1];
    if (pieceAt(boardstate, pawnLeftCoords)?.is(enemyColor, "Pawn"))
        return true;
    if (pieceAt(boardstate, pawnRightCoords)?.is(enemyColor, "Pawn"))
        return true;

    // TODO can honestly be removed at some point, this will never be true in a real game
    for (const offset of ROYAL_OFFSETS) {
        const targetCoords = [kingCoords[0] + offset[0], kingCoords[1] + offset[1]];
        if (pieceAt(boardstate, targetCoords)?.is(enemyColor, "King"))
            return true;
    }

    for (const offset of KNIGHT_OFFSETS) {
        const targetCoords = [kingCoords[0] + offset[0], kingCoords[1] + offset[1]];
        if (pieceAt(boardstate, targetCoords)?.is(enemyColor, "Knight"))
            return true;
    }

    for (const offset of ROOK_OFFSETS) {
        let piece = pieceTowards(boardstate, kingCoords, offset);
        if (piece?.is(enemyColor, "Rook") || piece?.is(enemyColor, "Queen"))
            return true;
    }

    for (const offset of BISHOP_OFFSETS) {
        let piece = pieceTowards(boardstate, kingCoords, offset);
        if (piece?.is(enemyColor, "Bishop") || piece?.is(enemyColor, "Queen"))
            return true;
    }

    return false;
}

/** recursive fn to scan along a row/col/diag to see if a given piece is in that direction.
 @return the piece in that offset direction along the board, or undefined if nothing is found. */
function pieceTowards(boardstate, coords, offset) {
    let nextCoords = [coords[0] + offset[0], coords[1] + offset[1]];
    if (outOfBounds(nextCoords))
        return undefined;
    if (pieceAt(boardstate, nextCoords) !== undefined) {
        return pieceAt(boardstate, nextCoords);
    }
    return pieceTowards(boardstate, nextCoords, offset);
}

export function outOfBounds(coords) {
    let [row, col] = coords;
    return row < 0 || row > 7 || col < 0 || col > 7;
}

function getKingCoords(boardstate, color) {
    for(let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {
            let coords = [row, col];
            if (pieceAt(boardstate, coords)?.is(color, "King")) {
                return coords;
            }
        }
    }
    return null; //should never happen
}

/** Generates a deepcopy of the boardstate & moves the piece at tile 'src' to tile 'dest', replacing anything there.
    Returns the board copy containing this modification. */
function previewModifiedBoard(boardstate, srcCoords, destCoords) {

    let deepcopy = structuredClone(boardstate);

    let srcRow = srcCoords[0];
    let srcCol = srcCoords[1];
    let destRow = destCoords[0];
    let destCol = destCoords[1];

    deepcopy[destRow][destCol] = deepcopy[srcRow][srcCol];
    deepcopy[srcRow][srcCol] = {};

    return deepcopy;

}

/** returns row digit concatenated with col digit. */
export function tileIdOf(coords){
    return coords[0] + "" + coords[1];
}
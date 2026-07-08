import {BISHOP_OFFSETS, KNIGHT_OFFSETS, ROOK_OFFSETS} from "./chessConsts";
import {outOfBounds, pieceAt} from "./chessUtils";

/** Determines if the given move from src to dest would NOT introduce check, or that it would escape any existing check.
 Assumes both coords are within the board. Note - will lead to undefined behavior if there is no piece at srcCoords. */
export default function isSafeMove(boardstate, srcCoords, destCoords) {

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
    const pawnRightCoords = [kingCoords[0] + pawnDirection, kingCoords[1] + 1];
    if (pieceAt(boardstate, pawnLeftCoords)?.is(enemyColor, "Pawn"))
        return true;
    if (pieceAt(boardstate, pawnRightCoords)?.is(enemyColor, "Pawn"))
        return true;

    // look for Knights
    for (const offset of KNIGHT_OFFSETS) {
        const targetCoords = [kingCoords[0] + offset[0], kingCoords[1] + offset[1]];
        if (pieceAt(boardstate, targetCoords)?.is(enemyColor, "Knight"))
            return true;
    }

    // look orthogonally for Rooks/Queens
    for (const offset of ROOK_OFFSETS) {
        let piece = pieceTowards(boardstate, kingCoords, offset);
        if (piece?.is(enemyColor, "Rook") || piece?.is(enemyColor, "Queen"))
            return true;
    }

    // look diagonally for Bishops/Queens
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

function getKingCoords(boardstate, color) {
    for (let row = 0; row <= 7; row++) {
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
 Returns the board copy containing this modification for safety review. */
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
import {isSafeMove, pieceAt} from "./chessUtils";
import {ROOK_OFFSETS, BISHOP_OFFSETS, ROYAL_OFFSETS, KNIGHT_OFFSETS} from "./chessConsts";

export function generateMoves(boardstate, piece) { // void
    switch(piece.type) {
        case "Pawn":    return generatePawnMoves(boardstate, piece);
        case "King":    return generateKingMoves(boardstate, piece);
        case "Knight":  return generateKnightMoves(boardstate, piece);
        case "Rook":    return generateSliderMoves(boardstate, piece, ROOK_OFFSETS);
        case "Bishop":  return generateSliderMoves(boardstate, piece, BISHOP_OFFSETS);
        case "Queen":   return generateSliderMoves(boardstate, piece, ROYAL_OFFSETS);
        default:        return [];
    }
}

function opposingColorOf(color) {
    return color === "White" ? "Black" : "White";
}

function generatePawnMoves(boardstate, piece) {
    let validMoveTargets = [];
    const whiteDirection = -1;
    const blackDirection = 1;
    const pieceDirection = piece.color === "Black" ? blackDirection : whiteDirection;
    const finalRow = piece.color === "Black" ? 7 : 0;
    const starterRow = piece.color === "Black" ? 1 : 6;

    const row = piece.row;
    if (row === finalRow) return; // will never happen under promotion

    // advance 1
    if (boardstate[piece.row + pieceDirection][piece.col].piece === undefined) {

        let srcCoords = [piece.row, piece.col];
        let destCoords = [piece.row + pieceDirection, piece.col];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push((piece.row + pieceDirection) + "" + piece.col);
        }

    }
    // advance 2
    if (row === starterRow
        && boardstate[piece.row + pieceDirection][piece.col].piece === undefined
        && boardstate[piece.row + (pieceDirection * 2)][piece.col].piece === undefined) {

        let srcCoords = [piece.row, piece.col];
        let destCoords = [piece.row + (pieceDirection * 2), piece.col];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push((piece.row + (pieceDirection * 2)) + "" + piece.col);
        }

    }
    // attack left
    const leftTargetTile = boardstate[piece.row + pieceDirection][piece.col - 1];

    if (leftTargetTile !== undefined && pieceIsEnemy(leftTargetTile.piece, piece.color)) {

        let srcCoords = [piece.row, piece.col];
        let destCoords = [piece.row + pieceDirection, piece.col - 1];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push((piece.row + pieceDirection) + "" + (piece.col - 1));
        }
    }
    // attack right
    const rightTargetTile = boardstate[piece.row + pieceDirection][piece.col + 1];

    if (rightTargetTile !== undefined && pieceIsEnemy(rightTargetTile.piece, piece.color)) {

        let srcCoords = [piece.row, piece.col];
        let destCoords = [piece.row + pieceDirection, piece.col + 1];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push((piece.row + pieceDirection) + "" + (piece.col + 1));
        }

    }
    return validMoveTargets;
}

function generateKingMoves(boardstate, piece) {
    let validMoveTargets = [];
    if (piece.color === "White") {
        validMoveTargets.push(whiteCastlingMoves(boardstate));
    } else if (piece.color === "Black") {
        validMoveTargets.push(blackCastlingMoves(boardstate));
    }

    ROYAL_OFFSETS.forEach((offset) => {
        const destRow = piece.row + offset[0];
        const destCol = piece.col + offset[1];

        if (outOfBounds(destRow, destCol)) return;

        const targetPiece = pieceAt(boardstate, [destRow, destCol]);

        if (pieceIsAlly(targetPiece, piece.color)) return;

        let srcCoords = [piece.row, piece.col];
        let destCoords = [destRow, destCol];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push(destRow + "" + destCol);
        }
    });

    return validMoveTargets;
}

function generateKnightMoves(boardstate, piece) {
    let validMoveTargets = [];
    KNIGHT_OFFSETS.forEach((offset) => {
        const destRow = piece.row + offset[0];
        const destCol = piece.col + offset[1];

        if (outOfBounds(destRow, destCol)) return; // exits this iteration of the callback

        const targetPiece = boardstate[destRow][destCol].piece;
        if (pieceIsAlly(targetPiece, piece.color)) return;

        console.log("Knight is at: " + piece.row + "" + piece.col);

        let srcCoords = [piece.row, piece.col];
        let destCoords = [destRow, destCol];

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push(destRow + "" + destCol);
        }

    });
    return validMoveTargets;
}

/* determines valid moves for pieces that "slide": Rooks, Queens,and Bishops. */
function generateSliderMoves(boardstate, piece, offsets) {
    let validMoveTargets = [];
    let srcCoords = [piece.row, piece.col];

    offsets.forEach(offset => {
        const rowOffset = offset[0];
        const colOffset = offset[1];
        scan(boardstate, srcCoords, rowOffset, colOffset, piece.row, piece.col, piece.color, validMoveTargets);
    });

    return validMoveTargets;
}

/* Looks along a rank, file, or diagonal to check for open tiles to move to, or enemy pieces to capture.
   Uses recursion to check each tile, increment offsets, and check until it goes off the board or hits an ally. */
function scan(boardstate, srcCoords, rowOffset, colOffset, row, col, color, validMoveTargets) {

    const destRow = row + rowOffset;
    const destCol = col + colOffset;
    const destCoords = [destRow, destCol];

    // base case: offset tile has gone off the board.
    if (outOfBounds(destRow, destCol)) return;

    const targetPiece = boardstate[destRow][destCol].piece;

    // base case: there's a piece in the way.
    if (targetPiece !== undefined) {
        if (pieceIsEnemy(targetPiece, color)) {
            if (isSafeMove(boardstate, srcCoords, destCoords)) {
                validMoveTargets.push(destRow + "" + destCol);
            }
        }
        return;
    }

    // empty tile? include (as long as it escapes check or doesn't introduce check) and keep going.
    if (isSafeMove(boardstate, srcCoords, destCoords)) {
        validMoveTargets.push(destRow + "" + destCol);
    }
    scan(boardstate, srcCoords, rowOffset, colOffset, row + rowOffset, col + colOffset, color, validMoveTargets);

}


function whiteCastlingMoves(boardstate) {
    // TODO implement using chessConsts and gameData regarding castling flags
    return [];
}

function blackCastlingMoves(boardstate) {
    // TODO implement using chessConsts and gameData regarding castling flags
    return [];
}

function outOfBounds(row, col) {
    return row < 0 || row > 7 || col < 0 || col > 7;
}

function pieceIsAlly(piece, yourColor) {
    return piece !== undefined && piece.color === yourColor;
}

function pieceIsEnemy(piece, yourColor) {
    return piece !== undefined && piece.color === opposingColorOf(yourColor);
}
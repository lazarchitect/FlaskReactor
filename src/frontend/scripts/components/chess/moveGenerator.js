import {outOfBounds, pieceAt, tileIdOf} from "./chessUtils";
import {BISHOP_OFFSETS, KNIGHT_OFFSETS, ROOK_OFFSETS, ROYAL_OFFSETS} from "./chessConsts";
import isSafeMove from "./moveSafetyVerifier";

export function generateMoves(boardstate, activePiece) {
    switch(activePiece.type) {
        case "Pawn":    return generatePawnMoves(boardstate, activePiece);
        case "King":    return generateKingMoves(boardstate, activePiece);
        case "Knight":  return generateNormalMoves(boardstate, activePiece, KNIGHT_OFFSETS);
        case "Rook":    return generateSliderMoves(boardstate, activePiece, ROOK_OFFSETS);
        case "Bishop":  return generateSliderMoves(boardstate, activePiece, BISHOP_OFFSETS);
        case "Queen":   return generateSliderMoves(boardstate, activePiece, ROYAL_OFFSETS);
        default:        return [];
    }
}

function generatePawnMoves(boardstate, activePiece) {

    let validMoveTargets = [];

    const srcCoords = [activePiece.row, activePiece.col];
    const pieceDirection = activePiece.color === "Black" ? 1 : -1;
    const finalRow = activePiece.color === "Black" ? 7 : 0;
    const starterRow = activePiece.color === "Black" ? 1 : 6;

    const advanceOneCoords =  [activePiece.row + pieceDirection, activePiece.col];
    const advanceTwoCoords =  [activePiece.row + (pieceDirection * 2), activePiece.col]
    const leftTargetCoords =  [activePiece.row + pieceDirection, activePiece.col - 1];
    const rightTargetCoords = [activePiece.row + pieceDirection, activePiece.col + 1];

    if (activePiece.row === finalRow) return []; // will never happen under promotion, TODO remove this later

    // advance 1
    if (pieceAt(boardstate, advanceOneCoords) === undefined) {

        if (isSafeMove(boardstate, srcCoords, advanceOneCoords)) {
            validMoveTargets.push(tileIdOf(advanceOneCoords));
        }

    }

    // advance 2
    if (activePiece.row === starterRow
        && pieceAt(boardstate, advanceOneCoords) === undefined
        && pieceAt(boardstate, advanceTwoCoords) === undefined) {
        
            if (isSafeMove(boardstate, srcCoords, advanceTwoCoords)) {
                validMoveTargets.push(tileIdOf(advanceTwoCoords));
            }

    }

    // attack left
    const leftTargetPiece = pieceAt(boardstate, leftTargetCoords);

    if (leftTargetPiece?.isOpposingColorOf(activePiece.color)) {

        if (isSafeMove(boardstate, srcCoords, leftTargetCoords)) {
            validMoveTargets.push(tileIdOf(leftTargetCoords));
        }
    }

    // attack right
    const rightTargetPiece = pieceAt(boardstate, rightTargetCoords);

    if (rightTargetPiece?.isOpposingColorOf(activePiece.color)) {

        if (isSafeMove(boardstate, srcCoords, rightTargetCoords)) {
            validMoveTargets.push(tileIdOf(rightTargetCoords));
        }

    }
    return validMoveTargets;
}

/** Simply checks all location targets offset from the activePiece by the given offset list.
 *  Normal as opposed to slider or Pawn movement. Used only by Knight and King.
 *  @returns array of target tile IDs if the space is open or enemy controlled, and moving there avoids being in check. */
function generateNormalMoves(boardstate, activePiece, offsets) {
    let validMoveTargets = [];
    offsets.forEach((offset) => {
        const destRow = activePiece.row + offset[0];
        const destCol = activePiece.col + offset[1];

        let srcCoords = [activePiece.row, activePiece.col];
        let destCoords = [destRow, destCol];

        if (outOfBounds(destCoords)) return;

        const targetPiece = pieceAt(boardstate, destCoords);

        if (targetPiece !== undefined && targetPiece.isAllyOf(activePiece)) return;

        if (isSafeMove(boardstate, srcCoords, destCoords)) {
            validMoveTargets.push(destRow + "" + destCol);
        }
    });
    return validMoveTargets;
}

/** Reviews any possible move targets from castling or normal movement.
 * @returns array of tile IDs for valid move targets */
function generateKingMoves(boardstate, activePiece) {
    let validMoveTargets = [];
    if (activePiece.color === "White") {
        validMoveTargets.push(whiteCastlingMoves(boardstate));
    } else if (activePiece.color === "Black") {
        validMoveTargets.push(blackCastlingMoves(boardstate));
    }

    validMoveTargets.push(...generateNormalMoves(boardstate, activePiece, ROYAL_OFFSETS));

    return validMoveTargets;
}

/** Determines valid moves for pieces that "slide": Rooks, Queens, and Bishops.
 * @return list of valid move target tile IDs. */
function generateSliderMoves(boardstate, activePiece, offsets) {
    let validMoveTargets = [];
    let srcCoords = [activePiece.row, activePiece.col];

    offsets.forEach(offset => {
        const rowOffset = offset[0];
        const colOffset = offset[1];
        scan(boardstate, srcCoords, rowOffset, colOffset, activePiece.row, activePiece.col, activePiece.color, validMoveTargets);
    });

    return validMoveTargets;
}

/** Looks along a rank, file, or diagonal to check for open tiles to move to, or enemy pieces to capture.
   Uses recursion to check each tile, increment offsets, and keep reviewing until it goes off the board or hits an ally. */
function scan(boardstate, srcCoords, rowOffset, colOffset, row, col, activeColor, validMoveTargets) {

    const destRow = row + rowOffset;
    const destCol = col + colOffset;
    const destCoords = [destRow, destCol];

    // base case: offset tile has gone off the board.
    if (outOfBounds(destCoords)) return;

    const targetPiece = pieceAt(boardstate, destCoords);

    // base case: there's a piece in the way.
    if (targetPiece !== undefined) {
        if (targetPiece.isOpposingColorOf(activeColor)) {
            if (isSafeMove(boardstate, srcCoords, destCoords)) {
                validMoveTargets.push(destRow + "" + destCol);
            }
        }
        return;
    }

    // empty tile? include it if it's safe, and keep going.
    if (isSafeMove(boardstate, srcCoords, destCoords)) {
        validMoveTargets.push(destRow + "" + destCol);
    }
    scan(boardstate, srcCoords, rowOffset, colOffset, row + rowOffset, col + colOffset, activeColor, validMoveTargets);

}

function whiteCastlingMoves(boardstate) {
    // TODO implement using chessConsts and gameData regarding castling flags
    return [];
}

function blackCastlingMoves(boardstate) {
    // TODO implement using chessConsts and gameData regarding castling flags
    return [];
}
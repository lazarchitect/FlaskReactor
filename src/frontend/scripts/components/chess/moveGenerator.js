import {outOfBounds, pieceAt, tileIdOf} from "./chessUtils";
import {
    BISHOP_OFFSETS,
    bkbStartTile,
    bknStartTile,
    bkStartTile,
    bqbStartTile,
    bqnStartTile,
    bqStartTile,
    KNIGHT_OFFSETS,
    ROOK_OFFSETS,
    ROYAL_OFFSETS,
    wkbStartTile,
    wknStartTile,
    wkStartTile,
    wqbStartTile,
    wqnStartTile,
    wqStartTile
} from "./chessConsts";
import isSafeMove from "./moveSafetyVerifier";

export default function generateMoves(boardstate, gameDetails, activePiece) {
    switch(activePiece.type) {
        case "Pawn":    return generatePawnMoves(boardstate, gameDetails, activePiece);
        case "King":    return generateKingMoves(boardstate, gameDetails, activePiece);
        case "Knight":  return generateNormalMoves(boardstate, activePiece, KNIGHT_OFFSETS);
        case "Rook":    return generateSliderMoves(boardstate, activePiece, ROOK_OFFSETS);
        case "Bishop":  return generateSliderMoves(boardstate, activePiece, BISHOP_OFFSETS);
        case "Queen":   return generateSliderMoves(boardstate, activePiece, ROYAL_OFFSETS);
        default:        return [];
    }
}

function generatePawnMoves(boardstate, gameDetails, activePiece) {

    let validMoveTargets = [];

    const srcCoords = [activePiece.row, activePiece.col];
    const pieceDirection = activePiece.color === "Black" ? 1 : -1;
    const initialRow = activePiece.color === "Black" ? 1 : 6;
    const enemyLeapRow = activePiece.color === "Black" ? 4 : 3;
    const enPassantTargetRow = enemyLeapRow + pieceDirection;

    const advanceOneCoords =  [activePiece.row + pieceDirection, activePiece.col];
    const advanceTwoCoords =  [activePiece.row + (pieceDirection * 2), activePiece.col]
    const leftTargetCoords =  [activePiece.row + pieceDirection, activePiece.col - 1];
    const rightTargetCoords = [activePiece.row + pieceDirection, activePiece.col + 1];

    // advance 1
    if (pieceAt(boardstate, advanceOneCoords) === undefined) {

        if (isSafeMove(boardstate, srcCoords, advanceOneCoords)) {
            validMoveTargets.push(tileIdOf(advanceOneCoords));
        }

    }

    // advance 2
    if (activePiece.row === initialRow
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

    // en passant
    if (gameDetails.pawn_leapt) {
        const [srcRow, srcCol] = srcCoords;

        if (Math.abs(gameDetails.pawn_leap_col - srcCol) === 1 && srcRow === enemyLeapRow) {
            const targetCoords = [enPassantTargetRow, gameDetails.pawn_leap_col];
            validMoveTargets.push(tileIdOf(targetCoords));
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
function generateKingMoves(boardstate, gameDetails, activePiece) {
    let validMoveTargets = [];
    if (activePiece.color === "White") {
        validMoveTargets.push(...whiteCastlingMoves(boardstate, gameDetails));
    } else if (activePiece.color === "Black") {
        validMoveTargets.push(...blackCastlingMoves(boardstate, gameDetails));
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
    scan(boardstate, srcCoords, rowOffset, colOffset, destRow, destCol, activeColor, validMoveTargets);

}

// these can be refactored for performance (via splitting up and using early returns) if that becomes necessary
function whiteCastlingMoves(boardstate, gameDetails) {

    let validCastlingTargets = [];

    let intermediateWkTilesEmpty = isEmpty(boardstate, wkbStartTile) && isEmpty(boardstate, wknStartTile);
    let intermediateWqTilesEmpty = isEmpty(boardstate, wqbStartTile) && isEmpty(boardstate, wqnStartTile) && isEmpty(boardstate, wqStartTile);

    if (!gameDetails.whitekingmoved) {

        let whiteIsSafeToCastleKingside = isSafeMove(boardstate, wkStartTile, wkbStartTile) && isSafeMove(boardstate, wkStartTile, wknStartTile);
        let whiteIsSafeToCastleQueenside = isSafeMove(boardstate, wkStartTile, wqStartTile) && isSafeMove(boardstate, wkStartTile, wqbStartTile);

        if (!gameDetails.wqr_moved && intermediateWqTilesEmpty && whiteIsSafeToCastleQueenside) {
            validCastlingTargets.push(wqbStartTile);
        }
        if(!gameDetails.wkr_moved && intermediateWkTilesEmpty && whiteIsSafeToCastleKingside) {
            validCastlingTargets.push(wknStartTile);
        }
    }
    return validCastlingTargets;
}

function blackCastlingMoves(boardstate, gameDetails) {

    let validCastlingTargets = [];

    let intermediateBkTilesEmpty = isEmpty(boardstate, bkbStartTile) && isEmpty(boardstate, bknStartTile);
    let intermediateBqTilesEmpty = isEmpty(boardstate, bqbStartTile) && isEmpty(boardstate, bqnStartTile) && isEmpty(boardstate, bqStartTile);

    if (!gameDetails.blackkingmoved) {

        let blackIsSafeToCastleKingside = isSafeMove(boardstate, bkStartTile, bkbStartTile) && isSafeMove(boardstate, bkStartTile, bknStartTile);
        let blackIsSafeToCastleQueenside = isSafeMove(boardstate, bkStartTile, bqStartTile) && isSafeMove(boardstate, bkStartTile, bqbStartTile);

        if (!gameDetails.bqr_moved && intermediateBqTilesEmpty && blackIsSafeToCastleQueenside) {
            validCastlingTargets.push(bqbStartTile);
        }
        if(!gameDetails.bkr_moved && intermediateBkTilesEmpty && blackIsSafeToCastleKingside) {
            validCastlingTargets.push(bknStartTile);
        }
    }
    return validCastlingTargets;
}

function isEmpty(boardstate, tileId) {
    return pieceAt(boardstate, tileId) === undefined;
}
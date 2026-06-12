import * as chessUtils from "./chessUtils";
import {inCheck, pieceAt} from "./chessUtils";
import * as chessConsts from "./chessConsts";

let activeCoords = [];

// TODO for #78: modify this function to adhere to the logic of #78 regarding move legality under check.
// so we need to make moves only generate highlights if they help escape check status, or do not enter it in the first place.
// TODO: refactor this function to use helper functions from chessUtils.js
export function generateHighlights(boardstate, piece) { // void

    let highlightedTiles = [];
    activeCoords = [piece.row, piece.col];

    const enemyColor = piece.color === "Black" ? "White" : "Black";

    const allyKingCoords = chessUtils.getKingCoords(boardstate, piece.color);

    console.log("ally king coords: " + allyKingCoords);

    if (piece.type === "Pawn") {
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
            let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

            // if currently in check, only add the highlight if the move escapes check.
            if (chessUtils.inCheck(boardstate, enemyColor)) {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + piece.col);
                }
            }
            // if not currently in check, add any highlight EXCEPT those that introduce check.
            else {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + piece.col);
                }
            }

        }
        // advance 2
        if (row === starterRow
            && boardstate[piece.row + pieceDirection][piece.col].piece === undefined
            && boardstate[piece.row + (pieceDirection * 2)][piece.col].piece === undefined) {

            let srcCoords = [piece.row, piece.col];
            let destCoords = [piece.row + (pieceDirection * 2), piece.col];
            let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

            if (chessUtils.inCheck(boardstate, enemyColor)) {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + (pieceDirection * 2)) + "" + piece.col);
                }
            } else {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + piece.col);
                }
            }

            highlightedTiles.push((piece.row + pieceDirection * 2) + "" + piece.col);


        }
        // attack left
        const leftTargetTile = boardstate[piece.row + pieceDirection][piece.col - 1];
        if (leftTargetTile !== undefined && leftTargetTile.piece !== undefined && leftTargetTile.piece.color === enemyColor) {

            let srcCoords = [piece.row, piece.col];
            let destCoords = [piece.row + pieceDirection, piece.col - 1];
            let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

            if (chessUtils.inCheck(boardstate, enemyColor)) {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + (piece.col - 1));
                }
            } else {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + (piece.col - 1));
                }
            }


        }
        // attack right
        const rightTargetTile = boardstate[piece.row + pieceDirection][piece.col + 1];
        if (rightTargetTile !== undefined && rightTargetTile.piece !== undefined && rightTargetTile.piece.color === enemyColor) {

            let srcCoords = [piece.row, piece.col];
            let destCoords = [piece.row + pieceDirection, piece.col + 1];
            let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

            if (chessUtils.inCheck(boardstate, enemyColor)) {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + (piece.col + 1));
                }
            } else {
                if (!chessUtils.inCheck(modifiedBoardstate, enemyColor)) {
                    highlightedTiles.push((piece.row + pieceDirection) + "" + (piece.col + 1));
                }
            }

        }
    }

    // possible refactoring: piece and color enums instead of strings?
    else if (piece.type === "King") {
        if (piece.color === "White") {
            highlightedTiles.push(whiteCastlingMoves(boardstate));
        } else if (piece.color === "Black") {
            highlightedTiles.push(blackCastlingMoves(boardstate));
        }

        // TODO: kings cannot move into a check position
        chessConsts.ROYAL_OFFSETS.forEach(offset => {
            const destRow = piece.row + offset[0];
            const destCol = piece.col + offset[1];

            if (!outOfBounds(destRow, destCol)) {
                const targetPiece = pieceAt(boardstate, [destRow, destCol]);
                console.log(targetPiece);
                if (targetPiece === undefined || targetPiece.color === enemyColor) {

                    // TODO much of this modifiedBoardstate check logic can be encapsulated and refactored into a callable function.
                    // just need to pass in a bunch of params but its still better IMO

                    let srcCoords = [piece.row, piece.col];
                    let destCoords = [destRow, destCol];
                    let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

                    console.log("after active piece moves to " + destCoords.toString() + ", you in check? " + inCheck(modifiedBoardstate, enemyColor));

                    if (inCheck(boardstate, enemyColor)) {
                        if (!inCheck(modifiedBoardstate, enemyColor)) {
                            highlightedTiles.push(destRow + "" + destCol);
                        }
                    } else {
                        if (!inCheck(modifiedBoardstate, enemyColor)) {
                            highlightedTiles.push(destRow + "" + destCol);
                        }
                    }

                    // highlightedTiles.push(destRow + "" + destCol);
                }
            }
        });
    } else if (piece.type === "Knight") {
        chessConsts.KNIGHT_OFFSETS.forEach(offset => {
            const destRow = piece.row + offset[0];
            const destCol = piece.col + offset[1];
            if (!outOfBounds(destRow, destCol)) {
                const targetPiece = boardstate[destRow][destCol].piece;
                if (targetPiece === undefined || targetPiece.color === enemyColor) {
                    highlightedTiles.push(destRow + "" + destCol);
                }
            }
        });
    } else if (piece.type === "Rook") {
        highlightedTiles = sliderMoves(piece, boardstate, chessConsts.ROOK_OFFSETS);
    } else if (piece.type === "Bishop") {
        highlightedTiles = sliderMoves(piece, boardstate, chessConsts.BISHOP_OFFSETS);
    } else if (piece.type === "Queen") {
        highlightedTiles = sliderMoves(piece, boardstate, chessConsts.ROYAL_OFFSETS);
    }

    return highlightedTiles;

}

// modify moveList and recurse to the next offset.
function sliderMoves(piece, boardstate, offsets) {
    let moveList = [];

    offsets.forEach(offset => {
        const rowOffset = offset[0];
        const colOffset = offset[1];
        scan(rowOffset, colOffset, piece.row, piece.col, piece.color, boardstate, moveList);
    });
    return moveList;
}

function scan(rowOffset, colOffset, row, col, color, boardstate, moveList) {

    const targetRow = row + rowOffset;
    const targetCol = col + colOffset;

    // base case: line has exited the board
    if (outOfBounds(targetRow, targetCol)) return;

    // base case: there's a piece in the way.
    const targetPiece = boardstate[targetRow][targetCol].piece;
    if (targetPiece !== undefined) {
        if (targetPiece.color !== color) {
            moveList.push(targetRow + "" + targetCol);
        }
        return;
    }

    // empty tile? include and keep going.
    moveList.push(targetRow + "" + targetCol);
    scan(rowOffset, colOffset, row + rowOffset, col + colOffset, color, boardstate, moveList);

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
// Small collection of helpful tools for front-end logic to support chess gameplay.

import {BLACK, PAWN, WHITE} from './chessConsts';

let SVG_SETS = ['grecian'];

/** Represents a chess piece.
    Useful mostly for semi-pseudocode readability, like piece.is("Black", "Pawn") instead of a more cumbersome function call.
    Note - these internal row and col references are updated on the server side and refreshed with socket update commands when pieces move.
    `pieceData` also has an unused piece ID field. */
class Piece {
    constructor(pieceData) {
        this.color = pieceData.color;
        this.type = pieceData.type;
        this.row = pieceData.row;
        this.col = pieceData.col;
    }
    isAllyOf(otherPiece) {return otherPiece !== undefined && this.color === otherPiece.color;}
    isOpposingColorOf(color) {return this.color === WHITE ? color === BLACK : color === WHITE;}
    is (color, type) {return this.color === color && type === this.type}
}

/** Fetches a piece at a location, if any. Note - we should use the 'optional chaining' operator on the result in most situations.
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

export function isPromotion(activePieceInfo, clickedTileId) {

    // these SHOULD be populated at this point
    if (activePieceInfo === {} || clickedTileId === undefined){
        console.log("checking promotion but activePieceInfo or clickedTileId is undefined");
        return false;
    }

    const finalRow = activePieceInfo.color === BLACK ? 7 : 0;
    const penultimateRow = activePieceInfo.color === BLACK ? 6 : 1;
    let clickedRow = parseInt(clickedTileId[0]);
    let activeRow = parseInt(activePieceInfo.tileId[0]);

    return activePieceInfo.type === PAWN && clickedRow === finalRow && activeRow === penultimateRow;
}

export function outOfBounds(coords) {
    let [row, col] = coords;
    return row < 0 || row > 7 || col < 0 || col > 7;
}

/** returns row digit concatenated with col digit. */
export function tileIdOf(coords){
    return coords[0] + "" + coords[1];
}

export function generatePieceMetadata(piece) {
    let set = payload.preferences.chess_piece_set;
    let ext = SVG_SETS.includes(set) ? "svg" : "png";
    if(set === undefined) set = "default";
    let imagePath = `/frontend/images/chess/${set}/${piece.color}${piece.type}.${ext}`;
    let altText = `A ${piece.color} ${piece.type}.`;
    return {imagePath, altText};
}
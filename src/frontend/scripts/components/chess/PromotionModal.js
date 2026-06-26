import React from "react";
import {BISHOP, BLACK, KNIGHT, QUEEN, ROOK, WHITE} from "./chessConsts";

export default function PromotionModal({tileId}) {

    let row = parseInt(tileId['0']);

    const pieces = [BISHOP, KNIGHT, QUEEN, ROOK];
    const color = row === 0 ? BLACK : WHITE;

    return (
        <div className={"promotionModal" + " promotionModal" + color} >
            { pieces.map(pieceType => <PromotionPiece key={pieceType} piece={{color: color, type: pieceType}} /> )}
        </div>
    );
}

function PromotionPiece ({piece}) {

    let imagePath = "/frontend/images/" + piece.color + piece.type + ".png";
    let altText = "A " + piece.color + " " + piece.type + ".";

    if (piece.type === "Bishop" && piece.color === "Black") {
        imagePath = "/frontend/svg/" + piece.color + piece.type + ".svg";
    }
    return <div className="promotionPieceDiv">
        <img src={imagePath} className="promotionPiece" alt={altText} />
    </div>;
}

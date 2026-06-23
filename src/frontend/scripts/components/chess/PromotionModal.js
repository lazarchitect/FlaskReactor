import React from "react";
import {BISHOP, KNIGHT, QUEEN, ROOK} from "./chessConsts";

export function PromotionModal({}) {

    const pieces = [BISHOP, KNIGHT, QUEEN, ROOK];
    const color =

    return (
        <div id="promotion-modal">
            {
                pieces.map(pieceType => {
                    let imagePath = "/frontend/images/" + color + pieceType + ".png";
                    let altText = "A " + color + " " + pieceType + ".";
                    return <img src={imagePath} className="pieceImg" alt={altText}/>;
                })
            }
        </div>
    );
}



export default function displayPromotionModal(clickedTileId) {

}
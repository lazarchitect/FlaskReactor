import React from "react";
import {BISHOP, BLACK, KNIGHT, QUEEN, ROOK, WHITE} from "./chessConsts";

export default function PromotionModal({tileId}) {

    let row = parseInt(tileId['0']);

    const pieces = [BISHOP, KNIGHT, QUEEN, ROOK];
    const pieceColor = row === 7 ? BLACK : WHITE;

    // following code slides element over if it went off left side of screen
    React.useEffect(() => {

        let promotionModal = document.querySelector(".promotionModal");
        let distanceToViewportLeft = promotionModal.getBoundingClientRect().left;
        let leftSpillover = Math.min(distanceToViewportLeft, 0);

        let desiredLeft = -95;

        if (leftSpillover < 0) {
            desiredLeft -= leftSpillover;
            promotionModal.style.left = `${desiredLeft}px`;
        }
    }, []);

    return (
        <div className={"promotionModal" + " promotionModal" + pieceColor} >
            { pieces.map(pieceType => <PromotionPiece key={pieceType} piece={{color: pieceColor, type: pieceType}} /> )}
        </div>
    );
}

function PromotionPiece ({piece}) {

    let imagePath = "/frontend/images/" + piece.color + piece.type + ".png";
    let altText = "A " + piece.color + " " + piece.type + ".";

    if (piece.type === "Bishop" && piece.color === "Black") {
        imagePath = "/frontend/svg/" + piece.color + piece.type + ".svg";
    }
    return <div className={"promotionPieceDiv" + " promotionPieceDiv" + piece.color}>
        <img src={imagePath} className="promotionPiece" alt={altText} />
    </div>;
}

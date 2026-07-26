import React, {useContext, useLayoutEffect, useState} from "react";
import {BISHOP, BLACK, KNIGHT, QUEEN, ROOK, WHITE} from "./chessConsts";
import {generatePieceMetadata} from "./chessUtils";
import {sendPromotionMoveUpdate} from "./chessSocket";
import {ActivePieceContext} from "./Chessboard";

export function PromotionModal({tileId}) {

    let [row, col] = [parseInt(tileId['0']), parseInt(tileId['1'])];

    const pieces = [BISHOP, KNIGHT, QUEEN, ROOK];
    const pieceColor = row === 7 ? BLACK : WHITE;

    const [left, setLeft] = useState(-80 + (80 * col));
    let top = pieceColor === WHITE ? "-5" : "95";

    // following code "retrieves" the modal if it initially rendered off side of screen
    useLayoutEffect(() => {
        let modalRect = document.getElementById("promotionModal").getBoundingClientRect();
        let [distanceToViewportLeft, distanceToViewportRight] = [modalRect.left, window.innerWidth - modalRect.right]; // negative values represent 'spillover'
        if (distanceToViewportLeft < 0) setLeft((prev) => prev - distanceToViewportLeft);
        else if (distanceToViewportRight < 0) setLeft((prev) => prev + distanceToViewportRight);
    }, []);

    return (
        <div id={"promotionModal"} className={"promotionModal" + pieceColor} style={{left: `${left}px`, top: `${top}%`}} >
            { pieces.map(pieceType => <PromotionChoice key={pieceType} tileId={tileId} piece={{color: pieceColor, type: pieceType}} /> )}
        </div>
    );
}

function PromotionChoice ({piece, tileId}) {

    const activePieceInfo = useContext(ActivePieceContext);

    let onClick = () => {
        sendPromotionMoveUpdate(activePieceInfo.tileId, tileId, piece.type);
    };

    let {imagePath, altText} = generatePieceMetadata(piece);

    return <div onClick={onClick} id={"promotionPieceDiv"} className={"promotionPieceDiv" + piece.color}>
        <img src={imagePath} className="promotionPiece" alt={altText} />
    </div>;
}

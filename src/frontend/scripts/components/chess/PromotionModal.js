import React, {useContext} from "react";
import {BISHOP, BLACK, KNIGHT, QUEEN, ROOK, WHITE} from "./chessConsts";
import {generatePieceMetadata} from "./chessUtils";
import {sendPromotionMoveUpdate} from "./chessSocket";
import {ActivePieceContext} from "./Chessboard";

export default function PromotionModal({tileId}) {

    let [row, col] = [parseInt(tileId['0']), parseInt(tileId['1'])];

    const pieces = [BISHOP, KNIGHT, QUEEN, ROOK];
    const pieceColor = row === 7 ? BLACK : WHITE;

    let initialLeft = -93;
    let left = initialLeft + (60*col);

    let top = pieceColor === WHITE ? -40 : 450;

    // following code "retrieves" the modal if it initially rendered off left side of screen
    React.useEffect(() => {

        let promotionModal = document.getElementById("promotionModal");
        let distanceToViewportLeft = promotionModal.getBoundingClientRect().left;
        let leftSpillover = Math.min(distanceToViewportLeft, 0);
        if (leftSpillover < 0) left -= leftSpillover;

        promotionModal.style.left = `${left}px`;
    }, []);

    return (
        <div id={"promotionModal"} className={"promotionModal" + pieceColor} style={{left: `${left}px`, top: `${top}px`}} >
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

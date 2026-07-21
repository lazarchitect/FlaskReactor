import {useDrop} from "react-dnd";
import {Torus} from "./Torus";
import {sendMoveUpdate} from "./quadSocket";
import {useContext} from "react";
import {SetBoardstateContext} from "../../roots/quadGameRoot";

export function useTorusDrop(targetTileData){

    const setBoardstate = useContext(SetBoardstateContext);

    return useDrop({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            sourceTileData: monitor.getItem()
        }),
        drop: ((sourceTileData) => {

            if (!isValidMove(sourceTileData, targetTileData)) return;

            setBoardstate((current) => tempDisplayMove(current, sourceTileData, targetTileData));
            sendMoveUpdate(sourceTileData, targetTileData);

        })
    })
}
export function isValidMove(sourceTileData, targetTileData) {

    let manhattanDistance = Math.abs(sourceTileData.row - targetTileData.row) + Math.abs(sourceTileData.col - targetTileData.col);
    let isInvalidDistance = manhattanDistance !== 1; // normal moves are exactly 1 orthogonal tile only (exceptions are Move Diagonal, F2S, Centerpult?)
    let allyAtTarget = ("torus" in targetTileData && targetTileData.torus.color === sourceTileData.torus.color);

    return !isInvalidDistance && !allyAtTarget;
}

/** Quickly and responsively display a move locally before the round trip to the server updates the board.
 *  Every level is copied into a new memory spot to avoid bad React unexpected behaviors.
 *  If the server detects any discrepancy in the boardstate, it should blast out the reverted boardstate in a few millis. */
function tempDisplayMove(current, sourceTileData, targetTileData) {

    const deepcopy = structuredClone(current);

    const sourceTile = deepcopy[sourceTileData.row][sourceTileData.col];
    const targetTile = deepcopy[targetTileData.row][targetTileData.col];

    targetTile.torus = sourceTile.torus;
    delete sourceTile.torus;

    return deepcopy;
}
import {useDrop} from "react-dnd";
import {Torus} from "./Torus";
import {sendMoveUpdate} from "./quadSocket";

export function useTorusDrop(targetTileData){
    return useDrop({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            sourceTileData: monitor.getItem()
        }),
        drop: ((sourceTileData) => {

            if (!isValidMove(sourceTileData, targetTileData)) return;

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
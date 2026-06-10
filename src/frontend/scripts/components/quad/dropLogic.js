import {useDrop} from "react-dnd";
import {Torus} from "./Torus";
import {quadSocketUpdate} from "./QuadSocket";

export function useTorusDrop(targetTileData){
    return useDrop(() => ({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            sourceTileData: monitor.getItem()
        }),
        drop: ((sourceTileData) => {

            if (!isValidMove(sourceTileData, targetTileData)) return;

            quadSocketUpdate(sourceTileData, targetTileData);

        })
    }))
}
export function isValidMove(sourceTileData, targetTileData) {

    let manhattanDistance = Math.abs(sourceTileData.row - targetTileData.row) + Math.abs(sourceTileData.col - targetTileData.col);
    let isInvalidDistance = manhattanDistance !== 1; // normal moves are exactly 1 orthogonal tile only (exceptions are Move Diagonal, F2S, Centerpult?)

    let allyAtTarget = ("torus" in targetTileData.contents && targetTileData.contents.torus.color === sourceTileData.contents.torus.color);

    return !isInvalidDistance && !allyAtTarget;
}

import React from "react";
import {Torus} from "./Torus";
import {useDrop} from "react-dnd";
import useSound from "use-sound";

/* subcomponent of a row, representing a single tile of the game board in an array of tiles. */
export function QuadTile ({ rowIndex, columnIndex, tileData, boardstate, setBoardstate }) {

    let [playPickupSound] = useSound('/static/sounds/pickup.wav');

    let tileId = "tile_"+rowIndex+"_"+columnIndex;

    const [{isOver, draggedItemData, monitor}, dropRef] = useDrop(() => ({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            draggedItemData: monitor.getItem(),
            monitor: monitor
        }),
        drop: ((item, monitor) => {

            // create a new boardstate memory representation for react rendering laziness
            const newBoardstate = [...boardstate];

            let sourceCoords = {row: item.dragRow, col: item.dragCol};
            let sourceTile = tileAtCoords(newBoardstate, sourceCoords);

            let targetCoords = coordsAtMouse(monitor.getClientOffset());
            let targetTile = tileAtCoords(newBoardstate, targetCoords);

            if (isInvalidMove(sourceTile, targetTile, sourceCoords, targetCoords)) {
                return;
            }

            targetTile.torus = sourceTile.torus;
            delete sourceTile.torus;

            setBoardstate(newBoardstate);

            playPickupSound();

        })
    }));

    // has a real piece
    if ("torus" in tileData && tileData.torus != null) {
        return (
            <div id={tileId} className="quadTile" ref={dropRef}>
                <Torus torus={tileData.torus} row={rowIndex} col={columnIndex}></Torus>
            </div>
        );
    }

    // is being hovered, display a ghost
    if (isOver) {

        // TODO is there a cleaner / more idiomatic way to determine move validity? have to copy and paste this code here
        let sourceCoords = {row: draggedItemData.dragRow, col: draggedItemData.dragCol};
        let sourceTile = tileAtCoords(boardstate, sourceCoords);

        let targetCoords = coordsAtMouse(monitor.getClientOffset());
        let targetTile = tileAtCoords(boardstate, targetCoords);

        if (!isInvalidMove(sourceTile, targetTile, sourceCoords, targetCoords)) {
            return (
                <div id={tileId} className="quadTile" ref={dropRef}>
                    <Torus torus={draggedItemData.torus} row={rowIndex} col={columnIndex} isGhost={true}></Torus>
                </div>
            );
        }
    }

    // is devoid of tori
    return <div id={tileId} className="quadTile" ref={dropRef}></div>;
}

function coordsAtMouse(mousePos) {
    let rec = document.getElementById("quadboard").getBoundingClientRect();
    let boardStartX = rec.left + window.scrollX;
    let boardStartY = rec.top + window.scrollY;

    let [boardClickX, boardClickY] = [mousePos.x - boardStartX, mousePos.y - boardStartY];

    let cellHeight = rec.height / 8;
    let row = Math.floor(boardClickY / cellHeight);

    let cellWidth = rec.width / 10;
    let col = Math.floor(boardClickX / cellWidth);

    return {row: row, col: col};
}

function tileAtCoords(boardstate, coords) {
    return boardstate[coords.row][coords.col];
}

function isInvalidMove(sourceTile, targetTile, sourceCoords, targetCoords) {

    let manhattanDistance = Math.abs(sourceCoords.row - targetCoords.row) + Math.abs(sourceCoords.col - targetCoords.col);
    let isInvalidDistance = manhattanDistance !== 1; // normal moves are exactly 1 orthogonal tile only (exceptions are Move Diagonal, F2S, Centerpult?)

    let allyAtTarget = ("torus" in targetTile && targetTile.torus.color === sourceTile.torus.color);

    return isInvalidDistance || allyAtTarget;

}
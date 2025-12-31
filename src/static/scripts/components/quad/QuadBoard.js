
import React, { useState } from "react";
import { useDrop } from "react-dnd";

import { QuadTile } from "./QuadTile";

export function QuadBoard(){

    const [boardstate, setBoardstate] = useState(payload.game.boardstate);

    const [{isOver}, dropRef] = useDrop(() => ({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver()
        }),
        drop: ((item, monitor) => {

            let sourceTile = boardstate[item.dragRow][item.dragCol];
            let targetTile = tileAtCoords(boardstate, coordsAtMouse(monitor.getClientOffset()));

            if (
                ("torus" in targetTile && targetTile.torus.color === item.torus.color) // target is occupied with ally
                || (targetTile === sourceTile) // cant drop to same location.
            ) {
               return;
            }

            targetTile.torus = sourceTile.torus;
            delete sourceTile.torus;

            setBoardstate(boardstate);

        }),
        hover: (item, monitor) => {

            let {row, col} = coordsAtMouse(monitor.getClientOffset());
            
            if (row > 7 || row < 0 || col > 9 || col < 0) { // out of bounds hover
                return;
            }

            let sourceTile = boardstate[item.dragRow][item.dragCol];
            let hoveredTile = tileAtCoords(boardstate, {row, col});

            if (!("torus" in hoveredTile)) {
                // TODO build out logic to temporarily display after-drop Torus while hovering a valid tile. Move drop logic to quadTile?
                // hoveredTile.torus = sourceTile.torus;
                // hoveredTile.torus.preview = true;
                // setBoardstate(boardstate);
            }

        }
    }));
    
    let rowArray = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        rowArray.push(<QuadRow key={rowIndex} rowIndex={rowIndex} rowData={boardstate[rowIndex]}></QuadRow>);
    }
    
    return (
        <div id="quadboard" ref={dropRef}>
            {rowArray}
        </div>
    )
}

/* subcomponent of a board, representing a single row of the game board in an array of rows. */
function QuadRow({ rowIndex, rowData }) {
    let tileArray = [];
    for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
        tileArray.push(<QuadTile key={columnIndex} columnIndex={columnIndex} rowIndex={rowIndex} tileData={rowData[columnIndex]}></QuadTile>);
    }
    return tileArray;
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
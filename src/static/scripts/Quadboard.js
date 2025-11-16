
import React, { useState } from "react";
import { useDrop } from "react-dnd";

import { QuadTile } from "./QuadTile";

export function QuadBoard(){

    const [boardstate, setBoardstate] = useState(payload.game.boardstate);

    const [{isOver}, dropRef] = useDrop(() => ({
        accept: 'Torus',
        collect: (monitor, props) => ({
            isOver: monitor.isOver()
        }),
        drop: ((item, monitor) => {


            // TODO extract to helper method?
            let rec = document.getElementById("quadboard").getBoundingClientRect();
            let mousePos = monitor.getClientOffset();
            let boardStartX = rec.left + window.scrollX;
            let boardStartY = rec.top + window.scrollY;
            
            let [boardClickX, boardClickY] = [mousePos.x - boardStartX, mousePos.y - boardStartY];

            let cellWidth = rec.width / 10;
            let dropCol = Math.floor(boardClickX / cellWidth);

            let cellHeight = rec.height / 8;
            let dropRow = Math.floor(boardClickY / cellHeight);

            let targetTile = boardstate[dropRow][dropCol];
            let sourceTile = boardstate[item.dragRow][item.dragCol];

            if (
                ("torus" in targetTile && targetTile.torus.color == item.torus.color) // target is occupied with ally 
                || (targetTile === sourceTile) // cant drop to same location.
            ) {
               return;
            }

            targetTile.torus = sourceTile.torus;
            delete sourceTile.torus;

            setBoardstate(boardstate);

        })
    }));
    
    let rowArray = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        rowArray.push(<QuadRow key={rowIndex} rowIndex={rowIndex} rowData={boardstate[rowIndex]}></QuadRow>);
    }
    
    return (
        <div id="quadboard" display='inline' ref={dropRef}>
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



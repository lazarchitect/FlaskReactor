import React, {useState} from "react";

import {QuadTile} from "./QuadTile";
import {connect} from "./QuadSocket";

export function QuadBoard(){

    const [boardstate, setBoardstate] = useState(payload.game.boardstate);

    React.useEffect(() => connect(setBoardstate), []);
    
    let rowArray = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        rowArray.push(
            <QuadRow
                key={rowIndex} rowIndex={rowIndex} rowData={boardstate[rowIndex]}
                boardstate={boardstate} setBoardstate={setBoardstate}>
            </QuadRow>
        );
    }
    
    return (
        <div id="quadboard">
            {rowArray}
        </div>
    )
}

/* subcomponent of a board, representing a single row of the game board in an array of rows. */
function QuadRow({ rowIndex, rowData, boardstate, setBoardstate })  {
    let tileArray = [];
    for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
        tileArray.push(
            <QuadTile
                key={columnIndex} columnIndex={columnIndex} rowIndex={rowIndex} tileData={rowData[columnIndex]}
                boardstate={boardstate} setBoardstate={setBoardstate}>
            </QuadTile>
        );
    }
    return tileArray;
}

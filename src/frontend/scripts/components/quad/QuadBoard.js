import React from 'react';
import {QuadTile} from "./QuadTile";

export function QuadBoard({boardstate}) {
    
    return (
        <div id="quadboard">
            {Array(8).fill(0).map((_, rowIndex) =>
                <QuadRow key={rowIndex} rowIndex={rowIndex} rowData={boardstate[rowIndex]} />
            )}
        </div>
    )
}

/* subcomponent of a board, representing a single row of the game board within an array of rows. */
function QuadRow({ rowIndex, rowData })  {

    return Array(10).fill(0).map((_, columnIndex) => {
        return <QuadTile key={columnIndex} tileData={{...rowData[columnIndex], row: rowIndex, col: columnIndex}} />;
    })

}


import React from "react";
import {Torus} from "./Torus";
import {tileDropBehavior, isValidMove} from "./DropLogic";

/* subcomponent of a QuadBoard's row, representing a single tile of the game board within a 2-D array. */
export function QuadTile ({ rowIndex, columnIndex, tileData, boardstate, setBoardstate }) {

    let tileId = "tile_" + rowIndex + "_" + columnIndex;

    const [{isOver, draggedItem, monitor}, dropRef] = tileDropBehavior(boardstate, setBoardstate);

    let hasOrb = "orb" in tileData;
    let hasTorus = "torus" in tileData && tileData.torus != null;
    let hasHoverGhost = isOver && isValidMove(draggedItem, monitor, boardstate);

    return <div id={tileId} className="quadTile" ref={dropRef}>

        { hasOrb && <div className="orb"></div> }
        { hasHoverGhost && <Torus torus={draggedItem.torus} row={rowIndex} col={columnIndex} isGhost={true}/> }
        { hasTorus && <Torus torus={tileData.torus} row={rowIndex} col={columnIndex}/> }

    </div>

}
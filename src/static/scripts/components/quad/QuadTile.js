
import React from "react";
import {Torus} from "./Torus";
import {tileDropBehavior, isValidMove} from "./DropLogic";

/* subcomponent of a row, representing a single tile of the game board in an array of tiles. */
export function QuadTile ({ rowIndex, columnIndex, tileData, boardstate, setBoardstate }) {

    let tileId = "tile_" + rowIndex + "_" + columnIndex;

    const [{isOver, draggedItem, monitor}, dropRef] = tileDropBehavior(boardstate, setBoardstate);

    let hasOrb = false; // TODO orb stuff
    let hasTorus = "torus" in tileData && tileData.torus != null;
    let hasHoverGhost = isOver && isValidMove(draggedItem, monitor, boardstate);

    return <div id={tileId} className="quadTile" ref={dropRef}>

        { hasOrb && <Orb orb={tileData.orb}/> }
        { hasHoverGhost && <Torus torus={draggedItem.torus} row={rowIndex} col={columnIndex} isGhost={true}/> }
        { hasTorus && <Torus torus={tileData.torus} row={rowIndex} col={columnIndex}/> }

    </div>

}
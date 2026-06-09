import React from "react";
import {Torus, TorusHoverGhost} from "./Torus";
import {isValidMove, useTorusDrop} from "./dropLogic";

/* subcomponent of a QuadBoard's row, representing a single tile of the game board within a 2-D array. */
export function QuadTile ({ tileData }) {

    let tileId = "tile_" + tileData.row + "_" + tileData.col;
    let tileContents = tileData.contents;

    const [{isOver, sourceTileData}, dropRef] = useTorusDrop(tileData);

    let hasOrb = "orb" in tileContents;
    let hasTorus = "torus" in tileContents && tileContents.torus != null;
    let hasHoverGhost = isOver && isValidMove(sourceTileData, tileData);

    return <div id={tileId} className="quadTile" ref={dropRef}>

        { hasOrb && <div className="orb" /> }
        { hasHoverGhost && <TorusHoverGhost torusData={sourceTileData.contents.torus} /> }
        { (hasTorus && !hasHoverGhost) && <Torus tileData={tileData} /> }

    </div>

}
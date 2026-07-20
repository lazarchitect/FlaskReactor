import React from "react";
import {Torus, TorusHoverGhost} from "./Torus";
import {isValidMove, useTorusDrop} from "./dropLogic";
import {Orb} from "./Orb";

/* subcomponent of a QuadBoard's row, representing a single tile of the game board within a 2-D array. */
export function QuadTile ({ tileData }) {

    let tileId = "tile_" + tileData.row + "_" + tileData.col;

    const [{isOver, sourceTileData}, dropRef] = useTorusDrop(tileData);

    let hasOrb = "orb" in tileData;
    let hasTorus = "torus" in tileData && tileData.torus != null;
    let hasHoverGhost = isOver && isValidMove(sourceTileData, tileData);

    return <div id={tileId} className="quadTile" ref={dropRef}>

        { hasOrb && <Orb /> }
        { hasHoverGhost && <TorusHoverGhost torusData={sourceTileData.torus} /> }
        { (hasTorus && !hasHoverGhost) && <Torus tileData={tileData} /> }

    </div>

}
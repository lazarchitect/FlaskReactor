import React from "react";
import {Torus, TorusHoverGhost} from "./Torus";
import {isValidMove, useTorusDrop} from "./dropLogic";
import {Orb} from "./Orb";

export const TILE_THICKNESS = 8;

/* subcomponent of a QuadBoard's row, representing a single tile of the game board within a 2-D array. */
export function QuadTile ({ tileData }) {

    let tileId = "tile_" + tileData.row + "_" + tileData.col;

    const [{isOver, sourceTileData}, dropRef] = useTorusDrop(tileData);

    let hasOrb = "orb" in tileData;
    let hasTorus = "torus" in tileData && tileData.torus != null;
    let hasHoverGhost = isOver && isValidMove(sourceTileData, tileData);

    const elevationDiff = tileData.elevation - 3;
    const elevationShift = elevationDiff * TILE_THICKNESS;
    const elevationZ = tileData.elevation * 3;
    const brightness = 200 + (elevationDiff * 20);
    const surfaceColor = `rgba(${brightness}, ${brightness}, ${brightness}, 1)`;
    let tileStyle = {right: elevationShift, bottom: elevationShift, zIndex: elevationZ};

    return <div id={tileId} className="quadTile" ref={dropRef} style={tileStyle}>

        <div className="quadTileBlock"/>
        <div className="quadTileSurface" style={{backgroundColor: surfaceColor}}/>

        { hasOrb && <Orb /> }
        { hasHoverGhost && <TorusHoverGhost torusData={sourceTileData.torus} /> }
        { (hasTorus && !hasHoverGhost) && <Torus tileData={tileData} /> }

    </div>

}
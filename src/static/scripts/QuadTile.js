
import React from "react";
import { Torus } from "./Torus";

/* subcomponent of a row, representing a single tile of the game board in an array of tiles. */
export function QuadTile ({ rowIndex, columnIndex, tileData }) {

    let tileId = "tile_"+rowIndex+"_"+columnIndex;
    
    if ("torus" in tileData && tileData.torus != null) {
        return (
            <div id={tileId} className="quadTile">
                <Torus torus={tileData.torus} row={rowIndex} col={columnIndex}></Torus>
            </div>
        );
    }

    return <div id={tileId} className="quadTile"></div>;
}

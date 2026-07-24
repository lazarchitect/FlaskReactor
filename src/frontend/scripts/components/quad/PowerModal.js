import React, {useRef} from "react";
import {TILE_THICKNESS} from "./QuadTile";

export function PowerModal({powers, tileData}) {
    if (powers === undefined) return null;

    const thisElement = useRef(null);

    const elevationDiff = tileData.elevation - 3;
    const elevationShift = TILE_THICKNESS * elevationDiff;
    const leftShift = ((tileData.col+1) * 80) + 3 - elevationShift;
    const topShift = 61 + ((tileData.row) * 80) - elevationShift;
    const modalStyle = {left: leftShift, top: topShift};

    return <div className="powerModal" style={modalStyle} ref={thisElement}>
        {Object.entries(powers).map((power) =>
            <div className="powerModalEntry" key={power[0]}>
                {`${power[1]}  ${power[0].replace(':', ' ')}`}
            </div>)
        }
    </div>;
}
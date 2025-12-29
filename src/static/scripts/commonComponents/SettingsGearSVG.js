
import React from 'react';

const size = 20;
const color = "#533";

const topLeft = size/-2;

export function SettingsGearSVG () {

    return <svg id="settingsGearSVG" viewBox={`${topLeft} ${topLeft} ${size} ${size}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle fill="none"	strokeWidth="3" stroke={color} cx="0" cy="0" r="4"/>
            <SettingsGearTooth deg={0} /> {/*down*/}
            <SettingsGearTooth deg={45} /> {/*down left*/}
            <SettingsGearTooth deg={90} /> {/*left*/}
            <SettingsGearTooth deg={135} /> {/*up left*/}
            <SettingsGearTooth deg={180} /> {/*up*/}
            <SettingsGearTooth deg={225} /> {/*up right*/}
            <SettingsGearTooth deg={270} /> {/*right*/}
            <SettingsGearTooth deg={315} /> {/*down right*/}
        </svg>
}

function SettingsGearTooth ({deg}) {
    const width = 3;
    return <rect
        className="settingsGearTooth"
        x={-width/2} y="4"
        fill={color} width={width} height="4"
        rx="1" ry="1"
        transform={`rotate(${deg}, 0,0)`} />
}
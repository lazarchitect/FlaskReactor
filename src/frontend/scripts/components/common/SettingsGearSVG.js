import React from 'react';

const size = 20;

const topLeft = size/-2;

export function SettingsGearSVG () {

    return <svg id="settingsGearSVG" viewBox={`${topLeft} ${topLeft} ${size} ${size}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle id="settingsGearRing" fill="none" stroke="currentColor" strokeWidth="3" cx="0" cy="0" r="4"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => <SettingsGearTooth key={deg} deg={deg} />)}
    </svg>
}

function SettingsGearTooth ({deg}) {
    const width = 3;
    return <rect
        className="settingsGearTooth"
        fill="currentColor"
        x={-width/2} y="4"
        width={width} height="4"
        rx="1" ry="1"
        transform={`rotate(${deg}, 0,0)`} />
}
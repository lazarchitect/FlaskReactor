import React from 'react';

export function Orb () {
    return <svg viewBox='0 0 100 100' className="orbSVG" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <linearGradient id="orbGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset='20%' stopColor="var(--stop1)"/>
            <stop offset='50%' stopColor="var(--stop2)"/>
        </linearGradient>
        <circle className="orbSVGCore"/>
        <circle className="orbSVGGlass"/>
    </svg>
}
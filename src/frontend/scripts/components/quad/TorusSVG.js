import React, {useState} from "react";
import {isYourTurn} from "./quadSocket";

const playerColors = {
    "red":    ["#e72424", "#6e0b0b"], "redHighlight":    ["#FF0000", "#CC0000"],
    "blue":   ["#0000ff", "#191983"], "blueHighlight":   ["#2583ff", "#2424e7"],
    "green":  ["#0fda41", "#08681c"], "greenHighlight":  ["#99FF99", "#44cc44"],
    "cyan":   ["#33cef5", "#038596"], "cyanHighlight":   ["#bdeefa", "#45d9ec"],
    "pink":   ["#d87deb", "#b409ca"], "pinkHighlight":   ["#fabdf2", "#f58aff"],
    "teal":   ["#2ccac2", "#036370"], "tealHighlight":   ["#39bfd1", "#009fb4"],
    "purple": ["#8e40ed", "#550b80"], "purpleHighlight": ["#cc81ff", "#af45ec"],
    "yellow": ["#cbe635", "#90a000"], "yellowHighlight": ["#effabd", "#d7ff27"],
    "orange": ["#eeb03d", "#a76d02"], "orangeHighlight": ["#f1d9aa", "#bd8a2d"]
    // can add more colors (bronze?) or like, dual colors, or other gradient types
};

/// CSS Utility functions for Torus glow on hover ///

const halo = (horizontal, vertical, color) => {
    let haloColor = playerColors[color + "Highlight"][0] + "99"; // 99 is alpha for translucency
    let blur = "3px";
    return `drop-shadow(${horizontal} ${vertical} ${blur} ${haloColor}) `;
}

// "allHalos" refers to the 4 halo drop-shadow effects needed in the 4 cardinal directions for an even visual.
const allHalosFilter = (color) => {
    let length = "1px";
    let negLength = "-" + length;
    return halo(length, "0px", color) + halo("0px", length, color) + halo(negLength, "0px", color) + halo("0px", negLength, color);
}

/// Components ///

export function TorusSVG ({ color, isRadiating, isGhost }) {

    let [isHovering, setIsHovering] = useState(false);

    let hasHalo = isHovering && isYourTurn() && color === payload.userColor;

    // will default to player2's color if the input is not passed in correctly
    if (color == null) console.log("no color passed to TorusSVG display logic");

    let isPlayer1Torus = color === payload.game.player1_color;
    let gradientType = isHovering ? "Highlight" : (isRadiating ? "Radial" : "");
    let colorGradientId = "torusCoreGradient" + (isPlayer1Torus ? "1" : "2") + gradientType;
    let colorGradientVal = "url(#" + colorGradientId + ")";

    let coreStyle = {filter: hasHalo ? allHalosFilter(color) : "none"};

    return (
        <svg viewBox='0 0 100 100' className='torusSVG' style={isGhost ? {opacity: "50%"} : {}}
        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
        version="1.1" xmlns="http://www.w3.org/2000/svg">

            <defs>
                <TorusCoreLinearGradient id="torusCoreGradient1" color={payload.game.player1_color} />
                <TorusCoreLinearGradient id="torusCoreGradient2" color={payload.game.player2_color} />
                <TorusCoreLinearGradient id="torusCoreGradient1Highlight" color={payload.game.player1_color + "Highlight"} />
                <TorusCoreLinearGradient id="torusCoreGradient2Highlight" color={payload.game.player2_color + "Highlight"} />
                <TorusCoreRadialGradient id="torusCoreGradient1Radial" color={payload.game.player1_color} />
                <TorusCoreRadialGradient id="torusCoreGradient2Radial" color={payload.game.player2_color} />
            </defs>

            <circle className='torusSVGBody' />
            <path className='torusSVGPath torusSVGPathTop' />
            <path className='torusSVGPath torusSVGPathBottom' />
            {/*Copilot says consider using an SVG <filter> element with feGaussianBlur + feOffset + feMerge, can improve performance*/}
            <circle className="torusSVGCore" fill={colorGradientVal} style={coreStyle} />
        </svg>
    );
}

function TorusCoreLinearGradient ({ color, id }) {
    return <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor={playerColors[color][0]} />
        <stop offset="100%" stopColor={playerColors[color][1]} />
    </linearGradient>;
}

function TorusCoreRadialGradient ({ color, id }) {
    return <radialGradient id={id} >
        <stop offset="0%" stopColor={playerColors[color][0]} />
        <stop offset="100%" stopColor={playerColors[color][1]} />
    </radialGradient>;
}

import React from "react";

// TODO move to QuadConsts?
const playerColors = {
    "red": ["#e72424ff", "#6e0b0bff"], "redHighlight": ["#FF0000", "#CC0000"],
    "blue": ["#0000ff", "#191983ff"], "blueHighlight": ["#2583ffff", "#2424e7ff"],
    "green": ["#0fda41ff", "#08681cff"], "greenHighlight": ["#99FF99", "#44cc44"],
    "cyan": ["#33cef5ff", "#038596ff"],  "cyanHighlight": ["#bdeefaff", "#45d9ecff"],
    "pink": ["#d87debff", "#b409caff"],  "pinkHighlight": ["#fabdf2ff", "#f58affff"],
    "purple": ["#6f00ffff", "#550b80ff"],  "purpleHighlight": ["#cc81ffff", "#af45ecff"],
    "teal": ["#2ccac2ff", "#036370ff"],  "tealHighlight": ["#39bfd1ff", "#009fb4ff"],
    "yellow": ["#cbe635ff", "#90a000ff"],  "yellowHighlight": ["#effabdff", "#d7ff27ff"],
    "orange": ["#eeb03dff", "#a76d02ff"],  "orangeHighlight": ["#f1d9aaff", "#bd8a2dff"]

    // can add more colors (bronze?) or like, dual colors, or other gradient types
};


export function TorusCoreLinearGradient ({ color, id }) {
    return <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
            <stop className="stop1" offset="0%" stopColor={playerColors[color][0]} />
            <stop className="stop2" offset="100%" stopColor={playerColors[color][1]} />
        </linearGradient>;
}

export function TorusCoreRadialGradient ({ color, id }) {
    return <radialGradient id={id} >
            <stop className="stop1" offset="0%" stopColor={playerColors[color][0]} />
            <stop className="stop2" offset="100%" stopColor={playerColors[color][1]} />
        </radialGradient>;
}
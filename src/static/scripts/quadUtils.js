
import React from "react";

// TODO move to QuadConsts?
const playerColors = {
    "red": ["#e72424ff", "#6e0b0bff"], 
    "blue": ["#0000ff", "#191983ff"],
    "green": ["#0fda41ff", "#08681cff"],
    "cyan": ["#33cef5ff", "#038596ff"],
    "pink": ["#d87debff", "#b409caff"],
    "purple": ["#6f00ffff", "#550b80ff"],
    "teal": ["#36ddd5ff", "#036370ff"],
    "yellow": ["#cbe635ff", "#90a000ff"],
    "orange": ["#eeb03dff", "#a76d02ff"]

    // can add more colors (bronze?) or like, dual colors, or other gradient types
};


export function TorusCoreGradient ({ color, id }) {
    return <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
            <stop className="stop1" offset="0%" stopColor={playerColors[color][0]} />
            <stop className="stop2" offset="100%" stopColor={playerColors[color][1]} />
        </linearGradient>;
}

import React from "react";

// TODO move to QuadConsts?
const playerColors = {
    "red": ["#e72424ff", "#6e0b0bff"], "red_highlight": ["#FF0000", "#CC0000"],
    "blue": ["#0000ff", "#191983ff"], "blue_highlight": ["#4444FF", "#0000FF"],
    "green": ["#0fda41ff", "#08681cff"], "green_highlight": [],
    "cyan": ["#33cef5ff", "#038596ff"],  "cyan_highlight": [],
    "pink": ["#d87debff", "#b409caff"],  "pink_highlight": [],
    "purple": ["#6f00ffff", "#550b80ff"],  "purple_highlight": [],
    "teal": ["#36ddd5ff", "#036370ff"],  "teal_highlight": [],
    "yellow": ["#cbe635ff", "#90a000ff"],  "yellow_highlight": [],
    "orange": ["#eeb03dff", "#a76d02ff"],  "orange_highlight": []

    // can add more colors (bronze?) or like, dual colors, or other gradient types
};


export function TorusCoreGradient ({ color, id }) {
    return <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
            <stop className="stop1" offset="0%" stopColor={playerColors[color][0]} />
            <stop className="stop2" offset="100%" stopColor={playerColors[color][1]} />
        </linearGradient>;
}
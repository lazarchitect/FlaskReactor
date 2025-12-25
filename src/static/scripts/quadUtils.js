
import React from "react";

export const playerColors = {
    "red":    ["#e72424", "#6e0b0b"], "redHighlight":     ["#FF0000", "#CC0000"],
    "blue":   ["#0000ff", "#191983"], "blueHighlight":    ["#2583ff", "#2424e7"],
    "green":  ["#0fda41", "#08681c"], "greenHighlight":   ["#99FF99", "#44cc44"],
    "cyan":   ["#33cef5", "#038596"],  "cyanHighlight":   ["#bdeefa", "#45d9ec"],
    "pink":   ["#d87deb", "#b409ca"],  "pinkHighlight":   ["#fabdf2", "#f58aff"],
    "purple": ["#6f00ff", "#550b80"],  "purpleHighlight": ["#cc81ff", "#af45ec"],
    "teal":   ["#2ccac2", "#036370"],  "tealHighlight":   ["#39bfd1", "#009fb4"],
    "yellow": ["#cbe635", "#90a000"],  "yellowHighlight": ["#effabd", "#d7ff27"],
    "orange": ["#eeb03d", "#a76d02"],  "orangeHighlight": ["#f1d9aa", "#bd8a2d"]
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
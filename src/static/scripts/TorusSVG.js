import React, { useState } from "react";
import {playerColors, TorusCoreLinearGradient, TorusCoreRadialGradient} from "./quadUtils";

const halo = (horizontal, vertical, color) => {
    let haloColor = playerColors[color + "Highlight"][0] + "99";
    let blur = "3px";
    return `drop-shadow(${horizontal} ${vertical} ${blur} ${haloColor}) `;
}

const allHalosFilter = (color) => {
    let length = "1px";
    let negLength = "-" + length;
    return halo(length, "0px", color) + halo("0px", length, color) + halo(negLength, "0px", color) +halo("0px", negLength, color);
}

export function TorusSVG ({ color, isRadiating }) {

    let [hover, setHover] = useState(false);

    let isPlayer1Torus = color === payload.game.player1_color;
    let gradientType = hover ? "Highlight" : (isRadiating ? "Radial" : "");
    let colorGradientId = "torusCoreGradient" + (isPlayer1Torus ? "1" : "2") + gradientType;
    let colorGradientVal = "url(#" + colorGradientId + ")";

    let coreStyle = {cx: "50%", cy: "50%", r: "20%"}
    coreStyle.filter = hover ? allHalosFilter(color) : "none";

    return (
        <svg className='torusSVG'
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
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
            <circle className='torusSVGCore' fill={colorGradientVal} style={coreStyle} />
        </svg>
    );
}
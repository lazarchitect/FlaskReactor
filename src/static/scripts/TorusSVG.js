import React, { useState } from "react";
import { TorusCoreLinearGradient, TorusCoreRadialGradient } from "./quadUtils";

export function TorusSVG ({ color, isRadiating }) {

    let [hover, setHover] = useState(false);

    let isPlayer1Torus = color === payload.game.player1_color;
    let gradientType = hover ? "Highlight" : (isRadiating ? "Radial" : "");
    let colorGradientId = "torusCoreGradient" + (isPlayer1Torus ? "1" : "2") + gradientType;
    let colorGradientVal = "url(#" + colorGradientId + ")";

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
            <circle className='torusSVGCore' fill={colorGradientVal} />
        </svg>
    );
}
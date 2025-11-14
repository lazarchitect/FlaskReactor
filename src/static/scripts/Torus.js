
import React from 'react';
import { useDrag } from 'react-dnd';
import { TorusCoreGradient } from './quadUtils';

export function Torus ({ torus, row, col }) {
    
    const [ { opacity }, dragRef, dragPreviewRef ] = useDrag(
        () => ({
            type: 'Torus',
            item: { torus: torus, dragRow: row, dragCol: col }, // gets passed to drop function
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.6 : 1
            })
        }),
        []
    );
    
    return <div className='torus' style={{cursor: "move", opacity: opacity}} ref={dragRef}>
        <TorusSVG color={torus.color}/>
    </div>;
}


function TorusSVG ({ color }) {

    let isPlayer1Torus = color == payload.game.player1_color;
    let colorGradientId = "torusCoreGradient" + (isPlayer1Torus ? "1" : "2");
    let colorGradientVal = "url(#" + colorGradientId + ")";

    return (
        <svg className='torusSVG' version="1.1" xmlns="http://www.w3.org/2000/svg">
            <TorusCoreGradient id="torusCoreGradient1" color={payload.game.player1_color} />
            <TorusCoreGradient id="torusCoreGradient2" color={payload.game.player2_color} />
            <circle className='torusSVGBody' />
            <path className='torusSVGPath torusSVGPathTop' />
            <path className='torusSVGPath torusSVGPathBottom' />
            <circle className='torusSVGCore' fill={colorGradientVal} />
        </svg>
    );
}

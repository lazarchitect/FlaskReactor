
import React from 'react';
import { useDrag } from 'react-dnd';

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

    // TODO edit torus image based on team color (and eventually, powerups).
    // can use SVG for this? or <canvas> pixel manipulation for the colors / adding elements, layers, etc
    
    
    return <div className='torus' style={{cursor: "move", opacity: opacity}} ref={dragRef}>
        <TorusSVG />
    </div>;
}


function TorusSVG () {

    return (
        <svg className='torusSVG' version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle className='torusSVGCircle' />
            <path className='torusSVGPath torusSVGPathTop' />
            <path className='torusSVGPath torusSVGPathBottom' />
        </svg>
    );

}
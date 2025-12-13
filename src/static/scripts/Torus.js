
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import useSound from 'use-sound';

import { TorusSVG } from './TorusSVG';

export function Torus ({ torus, row, col }) {

    let [playPickupSound] = useSound('/static/sounds/pickup.wav');

    // useState will be used here for color, powers, buffs, and debuffs later
    
    const [{ isDragging, opacity }, dragRef, dragPreview] = useDrag(
        () => ({
            type: 'Torus',
            item: { torus: torus, dragRow: row, dragCol: col }, // gets passed to drop function
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
                opacity: monitor.isDragging() ? 0.6 : 1
            })
        }),
        [torus] // react drag systems update their own records when this changes
    );


    if (isDragging) {
        playPickupSound();
    }


    // following code removes default browser Torus image during drag. 
    useEffect(
        () => {dragPreview(getEmptyImage(), { captureDraggingState: true });}, // possibly causing a bit of lag?
        [dragPreview]
    );

    return <div className='torus' style={{ cursor: "grab", opacity: opacity }} ref={dragRef}>
        <TorusSVG color={torus.color} isRadiating={false}/>
    </div>;
}

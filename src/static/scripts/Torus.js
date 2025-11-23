
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { TorusSVG } from './TorusSVG';
import { getEmptyImage } from 'react-dnd-html5-backend';

export function Torus ({ torus, row, col }) {
    
    const [ { opacity }, dragRef, dragPreviewRef ] = useDrag(
        () => ({
            type: 'Torus',
            item: { torus: torus, dragRow: row, dragCol: col }, // gets passed to drop function
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.6 : 1
            })
        }),
        [torus] // react drag systems update their own records when this changes
    );
    
    return <div className='torus' style={{cursor: "grab", opacity: opacity}} ref={dragRef}>
        <TorusSVG color={torus.color}/>
    </div>;
}


    // following code removes default browser Torus image during drag. 
    useEffect(
        () => {dragPreview(getEmptyImage(), { captureDraggingState: false });}, 
        [dragPreview]
    );

    return <div className='torus' style={{ cursor: "grab", opacity: opacity }} ref={dragRef}>
        <TorusSVG color={torus.color} isRadiating={false}/>
    </div>;
}

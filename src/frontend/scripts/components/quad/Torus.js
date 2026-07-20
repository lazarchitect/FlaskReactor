import React, {useEffect} from 'react';
import {useDrag} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

import {TorusSVG} from './TorusSVG';
import {isYourTurn} from "./quadSocket";

export function Torus ({ tileData }) {

    // useState will be used here for color, powers, buffs, and debuffs later

    const torusData = tileData.torus;

    const [{ opacity }, dragRef, dragPreview] = useDrag(
        () => ({
            type: 'Torus',
            item: tileData, // gets passed to drop function
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0 : 1
            })
        }),
        // react drag systems update their own records when this changes.
        [torusData]
    );

    // following code removes default browser Torus image during drag.
    useEffect(
        () => {dragPreview(getEmptyImage(), { captureDraggingState: true });}, // possibly causing a bit of lag?
        [dragPreview]
    );

    const draggable = isYourTurn() ? dragRef : null;

    return <div className='torus' style={{ cursor: "grab", opacity: opacity }} ref={draggable}>
        <TorusSVG color={torusData.color} isRadiating={false} isGhost={false} />
    </div>;
}

export function TorusHoverGhost({torusData}) {
    return <div className='torus'>
        <TorusSVG color={torusData.color} isRadiating={false} isGhost={true} />
    </div>;
}

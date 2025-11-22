
import React from 'react';
import { useDragLayer } from 'react-dnd';
import { Torus } from './Torus';

export function TorusDragLayer (props) {

    // WIP build out custom Torus drag layer for drag preview as part of Issue 111
    // sample code can be found here: https://codesandbox.io/p/sandbox/react-dnd-custom-drag-layer-8v7s3?file=%2Fsrc%2FCustomDragLayer.jsx

    const dragLayer = useDragLayer((monitor) => {
        console.log(monitor.getItem());
    });

    return (
        <Torus torus={{"color": "green"}} />
    );


}
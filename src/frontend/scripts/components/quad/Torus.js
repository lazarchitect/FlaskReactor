import React, {useContext, useEffect, useState} from 'react';
import {useDrag} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

import {TorusSVG} from './TorusSVG';
import {QuadContext} from "../../roots/quadGameRoot";
import {PowerModal} from "./PowerModal";

export function Torus ({ tileData }) {

    const {legendState} = useContext(QuadContext);

    const [showPowerModal, setShowPowerModal] = useState(false);
    const [powerModalPinned, setPowerModalPinned] = useState(false);

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

    const draggable = dragRef;//(isYourTurn() && torusData.color === payload.userColor) ? dragRef : null;

    const powers = legendState.playerPowers[torusData.name];
    const torusStyles = { cursor: "grab", opacity: opacity };
    function showModal(bool) {return () => !powerModalPinned && setShowPowerModal(bool);}
    const handleClick = () => {
        setPowerModalPinned((prev) => !prev);
        setShowPowerModal(true); // ensure it's visible once pinned
    };

    useEffect(() => {
        if (!powerModalPinned) return;

        const handleBoardClick = (event) => {
            const clickedOnThisTorus = event.target.closest(`#${torusData.name}`); // returns falsy null if no ancestor found by that ID
            if (!clickedOnThisTorus) {
                setPowerModalPinned(false);
                setShowPowerModal(false);
            }
        };

        document.getElementById("quadboard").addEventListener("mousedown", handleBoardClick);
        return () => document.getElementById("quadboard").removeEventListener("mousedown", handleBoardClick);
    }, [powerModalPinned, torusData.name]);

    return <div id={torusData.name} className='torus' style={torusStyles}
                onMouseEnter={showModal(true)}
                onMouseLeave={showModal(false)}
                onClick={handleClick}
                ref={draggable}>
        <TorusSVG color={torusData.color} isRadiating={false} isGhost={false} />
        {showPowerModal && <PowerModal powers={powers}/>}
    </div>;
}

export function TorusHoverGhost({torusData}) {
    return <div className='torus'>
        <TorusSVG color={torusData.color} isRadiating={false} isGhost={true} />
    </div>;
}

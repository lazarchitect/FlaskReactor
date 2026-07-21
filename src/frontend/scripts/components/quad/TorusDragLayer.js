import React from 'react';
import {useDragLayer} from 'react-dnd';
import {TorusSVG} from './TorusSVG';

/** Defines what gets rendered WHILE a torus is being dragged;
 *  in other words, the thing that follows your mouse. */
export function TorusDragLayer () {

	const {sourceTileData, initialOffset, currentOffset} = useDragLayer((monitor) => ({
		sourceTileData: monitor.getItem(),
		initialOffset: monitor.getInitialSourceClientOffset(),
		currentOffset: monitor.getSourceClientOffset()
	}));

	if (sourceTileData?.torus === undefined) return null; // not dragging anything.

    const dragStyles = getDragStyles(initialOffset, currentOffset);

	return (
		<div style={dragStyles} className='torusDragLayer'>
			<TorusSVG color={sourceTileData.torus.color} isRadiating={true}/>
		</div>
	);
}

function getDragStyles(initialOffset, currentOffset) {
	
	if (!initialOffset || !currentOffset) {
		return {
			display: "none",
		};
	}
	let { x, y } = currentOffset;
	const transform = `translate(${x}px, ${y}px)`;
	return {
		transform,
		WebkitTransform: transform,
	};
}
import React from 'react';
import {useDragLayer} from 'react-dnd';
import {TorusSVG} from './TorusSVG';

/** this class defines what gets rendered WHILE a torus is being dragged;
 * in layman's terms, the thing that follows your mouse.
 */
export function TorusDragLayer () {

	const {sourceTileData, initialOffset, currentOffset} = useDragLayer((monitor) => ({
		sourceTileData: monitor.getItem(),
		initialOffset: monitor.getInitialSourceClientOffset(),
		currentOffset: monitor.getSourceClientOffset(),
	}));

	if (sourceTileData?.contents?.torus === undefined) return null; // not dragging anything.

	const torus = sourceTileData.contents.torus;

    const dragStyles = getDragStyles(initialOffset, currentOffset);

	const layerStyles = {
		position: "fixed",
		pointerEvents: "none",
		zIndex: 100,
		left: 0,
		top: 0,
		width: "100%",
		height: "100%",
	};

	return (
		<div style={layerStyles}>
			<DragTorus color={torus.color} dragStyles={dragStyles} />
		</div>
	);
}

function DragTorus ({color, dragStyles}) {
	
	return (
	    <div style={dragStyles} className='previewTorus'>
            <TorusSVG color={color} isRadiating={true}/>
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
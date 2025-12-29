
import React from 'react';
import { useDragLayer } from 'react-dnd';
import { TorusSVG } from './TorusSVG';

export function TorusDragLayer (props) {

	const {item, itemType, initialOffset, currentOffset, isDragging} = useDragLayer((monitor) => ({
	  item: monitor.getItem(),
	  itemType: monitor.getItemType(),
	  initialOffset: monitor.getInitialSourceClientOffset(),
	  currentOffset: monitor.getSourceClientOffset(),
	  isDragging: monitor.isDragging(),
	}));

	if (item == null) return; // not dragging anything.

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

	if (item.torus == undefined) {
		console.log(JSON.stringify(item));
		return;
	}

	return (
		<div style={layerStyles}>
			<DragTorus color={item.torus.color} dragStyles={dragStyles} />
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
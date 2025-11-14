'use strict';

import React from 'react'; // required by React
import { createRoot } from 'react-dom/client';

import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SiteHeader } from './CommonComponents';
import { Torus } from './Torus';

// TODO definitely extract these functional components into their own file(s) and then have game logic live in other files
// this file is just for grabbing the QuadBoard and other elements on the screen (chat, menu, etc)

function QuadTile ({ rowIndex, columnIndex, tileData }) {


    let tileId = "tile_"+rowIndex+"_"+columnIndex;
    
    if ("torus" in tileData) {
        return (
            <div id={tileId} className="quadTile">
                <Torus torus={tileData.torus} row={rowIndex} col={columnIndex}></Torus>
            </div>
        );
    }

    return (<div id={tileId} className="quadTile"></div>);
}


function QuadRow({ rowIndex, rowData }) {
    let tileArray = [];
    for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
        tileArray.push(<QuadTile key={columnIndex} columnIndex={columnIndex} rowIndex={rowIndex} tileData={rowData[columnIndex]}></QuadTile>);
    }
    return tileArray;
}

function QuadBoard(){

    const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);

    const [{isOver, _}, dropRef] = useDrop(() => ({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        }),
        drop: ((item, monitor) => {
            
            // TODO extract to helper method?
            let rec = document.getElementById("quadboard").getBoundingClientRect();
            let mousePos = monitor.getClientOffset();
            let boardStartX = rec.left + window.scrollX;
            let boardStartY = rec.top + window.scrollY;
            
            let [boardClickX, boardClickY] = [mousePos.x - boardStartX, mousePos.y - boardStartY];

            let cellWidth = rec.width / 10;
            let dropCol = Math.floor(boardClickX / cellWidth);

            let cellHeight = rec.height / 8;
            let dropRow = Math.floor(boardClickY / cellHeight);

            let targetTile = boardstate[dropRow][dropCol];
            let sourceTile = boardstate[item.dragRow][item.dragCol];

            if (
                ("torus" in targetTile && targetTile.torus.color == item.torus.color) // target is occupied with ally 
                || (targetTile === sourceTile) // cant drop to same location.
            ) {
                return;
            }

            targetTile.torus = item.torus;
            delete boardstate[item.dragRow][item.dragCol].torus;

            setBoardstate(boardstate);

        })
    }));

    
    let rowArray = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        rowArray.push(<QuadRow key={rowIndex} rowIndex={rowIndex} rowData={boardstate[rowIndex]}></QuadRow>);
    }
    
    return (
        <div id="quadboard" display='inline' ref={dropRef}>
            {rowArray}
        </div>
    )
}

var page = (
	<div id="reactRoot">

        {/* top of the page */}
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        
        {/* rest of the page */}
        <div id="quadPlayArea"> 
            <DndProvider backend={HTML5Backend}>
                <QuadBoard />
            </DndProvider>
            <p>Status: <span id="status"></span></p>
        </div>
        
    </div>
);

var rootElement = document.getElementById("root");
var reactRoot = createRoot(rootElement);
reactRoot.render(page);

'use strict';

import React from 'react'; // do I need this?    yes
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './CommonComponents';
import { Torus } from './Torus';

<div />

function QuadTile (props) {

    if (props.tileData.piece != undefined) {
        return <div className="quadTile"><Torus piece={props.tileData.piece}></Torus></div> 
    }

    return <div className="quadTile"></div>
}


function QuadRow(props) {
    let tileArray = [];
    for (let tileIndex = 0; tileIndex < 10; tileIndex++) {
        tileArray.push(<QuadTile key={tileIndex} tileData={props.rowData[tileIndex]}></QuadTile>);
    }
    return tileArray;
}

function QuadBoard(props){
    
    let rowArray = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        rowArray.push(<QuadRow key={rowIndex} rowData={props.boardstate[rowIndex]}></QuadRow>);
    }
    
    return (
        <div id="quadboard" display='inline'>
            {rowArray}
        </div>
    )
}

var page = (
	<div id="reactRoot" onMouseMove={(e) => console.log(e.clientX, e.clientY)}>

        {/* top of the page */}
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        
        {/* rest of the page */}
        <div id="quadPlayArea">
            <QuadBoard boardstate={payload.boardstate}/>
            <p>Status: <span id="status"></span></p>
        </div>
        
    </div>
);

var rootElement = document.getElementById("root");
var reactRoot = createRoot(rootElement);
reactRoot.render(page);

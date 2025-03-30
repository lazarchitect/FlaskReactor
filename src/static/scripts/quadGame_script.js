'use strict';

function torusClick() {
    console.log("Hello, World!");
}

function Torus (props) {
    return <img className="torus" src="/static/images/quadradius/torus_default.png" onClick={torusClick}></img>
}

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

var reactRoot = (
	<div id="reactRoot">
        {/* top of the page */}
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        
        {/* rest of the page */}
        <div id="quadPlayArea">
            <QuadBoard boardstate={payload.boardstate}/>
            <p>Status: <span id="status"></span></p>
        </div>
        
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

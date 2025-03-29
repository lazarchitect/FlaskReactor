'use strict';

function QuadTile (props) {

    console.log(props.tileData);

    if (props.tileData.piece !== null) { // undefined?
        // TODO display piece (torus) if piece data is present 
    }

    return <div className="quadTile">
        {
            if (props.s == "2")
        }
    </div>
}


function QuadRow(props) {
    let tileArray = [];
    for (let tileIndex = 0; tileIndex < 10; tileIndex++) {
        tileArray.push(<QuadTile key={tileIndex} tileData={props.rowData[tileIndex]}></QuadTile>);
    }
    return tileArray;
}

function QuadBoard(props){

    console.log(props);
    
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

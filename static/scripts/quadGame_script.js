'use strict';

function QuadTile (props) {
    // console.log(index);
    // console.log(jk);
    return <div key={props[0]} className={"quadTile"}></div>
}


function QuadRow() {
    let tileArray = [];
    for (let i = 0; i < 10; i++) {
        tileArray.push(<QuadTile props={[i, 2]}></QuadTile>);
    }
    return tileArray;
}

function QuadBoard(boardstate){
    
    let rowArray = [];
    for (let i = 0; i < 8; i++) {
        rowArray.push(<QuadRow key={i}></QuadRow>);
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

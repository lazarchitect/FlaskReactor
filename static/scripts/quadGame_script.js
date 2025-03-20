'use strict';

function QuadBoard(boardstate){
    return boardstate + "Hello, World!"
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

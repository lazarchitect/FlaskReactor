'use strict';

var reactRoot = (
	<div id="reactRoot">
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        <div id="chessPlayArea">
            <Chessboard boardstate={payload.boardstate}/>
            <p>Status: <span id="status"></span></p>
        </div>
        
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

'use strict';

var reactRoot = (
	<div id="reactRoot">
        <SiteHeader username={payload.username}/>
        <Chessboard boardstate={payload.boardstate}/>
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

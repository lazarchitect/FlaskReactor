'use strict';

var reactRoot = (
	<div id="reactRoot">
        <SiteHeader username={payload.username}/>
        <Board boardstate={payload.boardstate}/>
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

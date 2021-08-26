'use strict';

var reactRoot = (
    <div id="gamePage">
        <SiteHeader username={payload.username}/>
        <Board gamestate={gamestate}/>
        <LogoutButton/>
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

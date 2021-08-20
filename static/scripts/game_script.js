'use strict';

var reactRoot = (
    <div id="gamePage">
        <Board gamestate={gamestate}/>
        <LogoutButton/>
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

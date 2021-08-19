'use strict';

var reactRoot = (
    <div id="gamePage">
        <Board gamestate={gamestate}/>
        <form action="/logout" method="POST"><input id="logout" type="submit" value="Log Out"/></form>
    </div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

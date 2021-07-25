'use strict';

var reactRoot = (
    <div id="gamePage">
        <Board gamestate={gamestate}/>
        <form action="/logout" method="POST"><input type="submit" value="Log Out"/></form>
    </div>
);

var rootDiv = document.getElementById("root");

if(rootDiv !== null){
    ReactDOM.render(reactRoot, rootDiv);
}


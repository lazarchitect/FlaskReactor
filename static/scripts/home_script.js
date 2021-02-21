'use strict';

const chessboard = React.createElement(Board, gamestate=gamestate);

var rootDiv = document.getElementById("root");

if(rootDiv !== null){
    ReactDOM.render(chessboard, rootDiv);
}


'use strict';

const chessboard = React.createElement(Board);

var rootDiv = document.getElementById("root");

if(rootDiv !== null){
    ReactDOM.render(chessboard, rootDiv);
}


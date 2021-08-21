
const gameId = payload.game.gameId;

function websocketConnect() {
	// simply connect to WS. In order to update the game board, server will need these things: gameId, gameType, boardstate index, etc

	console.log("initializing WS")
    const clientSocket = new WebSocket("ws://localhost:5000/websocket")
	clientSocket.onopen = (() => clientSocket.send(JSON.stringify({"request": "subscribe", "gameId": gameId})));

    clientSocket.onmessage = (message) => {
		// TODO handle websocket message from server. update board or chat message.
		console.log("Message from server: ", message.data); 
    };

    var board = document.getElementById("tttBoard");
    board.onclick = function(){
    	console.log("click detected: sending message to socketServer.");

		// TODO implement this next line
		const boardIndex = calculateBoardIndex(getClickLocation(mouseClickEvent));

    	clientSocket.send(JSON.stringify({"request": "update", "gameId": gameId, "gameType": "ttt", player=payload.username, boardIndex=boardIndex}));
    };
}


function TttBoardRow(props){
	const row = props.row;
	// props.values will look like ["X", "X", "O"]. each is a cellItem
	return (props.values).map((cellItem, index) => 
			<span 
				key={index} 
				className="tttCell" 
				style={{left: 75+(index*150) + "px", top: 70+(row*150) + "px"}}
			>
				{cellItem === "" ? " ": cellItem}
			</span>
	);
}

function TttBoard(){

	payload.game.boardstate = ['X', 'X', 'O', 'O', 'X', 'X', 'O', 'X', 'O'];
	const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);
	
	React.useEffect(() => websocketConnect(), []); 
	// empty array is a list of values that would trigger the function if they change. we dont want any.

	return (
		<div id="tttBoard">
			
			<svg id="octothorpe" width="500px" height="500px" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  				<rect className="rectLine" x="166" y="50" width="12" height="400" rx="5" />
				<rect className="rectLine" x="330" y="50" width="12" height="400" rx="5"/>
				<rect className="rectLine" x="50" y="166" width="400" height="12" rx="5"/>
				<rect className="rectLine" x="50" y="330" width="400" height="12" rx="5"/>
			</svg>
			<div id="tttBoardData">
				<TttBoardRow row={0} values={boardstate.slice(0,3)} /><br/>
				<TttBoardRow row={1} values={boardstate.slice(3,6)}/><br/>
				<TttBoardRow row={2} values={boardstate.slice(6,9)}/><br/>
			</div>
		</div>
	)
}

var rootElem = (
	<div id="tttGamePage">
		<TttBoard/>
		<LogoutButton/>
	</div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv);
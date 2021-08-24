
const gameId = payload.game.id;
var yourTurn = payload.yourTurn;

function wsSubscribe(clientSocket){
	const subscribeObj = {
		"request": "subscribe", 
		"gameId": gameId
	};
	const subscribeJSON = JSON.stringify(subscribeObj);
	clientSocket.send(subscribeJSON);
}

function wsUpdate(clientSocket, boardIndex){
	const updateObj = {
		"request": "update", 
		"gameId": gameId, 
		"gameType": "ttt", 
		"player": payload.username, 
		"boardIndex": boardIndex
	};
	const updateStr = JSON.stringify(updateObj);
    clientSocket.send(updateStr);
}

function wsConnect(setBoardstate, setYourTurn) {

	console.log("initializing WS")
    const clientSocket = new WebSocket("ws://localhost:5000/websocket")

	clientSocket.onopen = (() => wsSubscribe(clientSocket));

    clientSocket.onmessage = (message) => {
		// TODO handle websocket message from server. update board or chat message.
		const data = JSON.parse(message.data);
		if(data.command === "update"){
			
			// TODO handle various things from the server. you went, opponent went, etc
			
			const boardIndex = data.boardIndex;
			document.getElementById(boardIndex).innerHTML = data.piece;

			setYourTurn(payload.username === data.activePlayer);

		}
		else if(data.command === "info"){
			console.log(data.contents);
		}
		else if(data.command === "error"){
			console.log(data.contents);
		}

    };

    var board = document.getElementById("tttBoard");
    board.onclick = function(mouseClick){
		if(mouseClick.target.className != "tttCell activeTttCell") return;
    	console.log("click detected: sending message to socketServer.");
		const boardIndex = mouseClick.target.id;
		wsUpdate(clientSocket, boardIndex);
    };
}

/////////////////////////////////////
///// REACT COMPONENT FUNCTIONS /////
/////////////////////////////////////

function TttBoardRow(props){
	const row = props.row;
	// props.values will look like ["X", "X", "O"]. each is a cellItem
	return (props.values).map((cellItem, index) => 
			<span 
				key={index} 
				className={"tttCell" + ((props.yourTurn && cellItem=="" && payload.username!="") ? " activeTttCell": "")}
				id={index+(row*3)}
				style={{left: 75+(index*150) + "px", top: 70+(row*150) + "px"}}
			>
				{cellItem}
			</span>
	);
}

function TttBoard(){

	// payload.game.boardstate = ['X', 'X', 'O', 'O', 'X', 'X', 'O', 'X', 'O'];
	const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);

	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn); 
	
	React.useEffect(() => wsConnect(setBoardstate, setYourTurn), []); 
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
				<TttBoardRow yourTurn={yourTurn} row={0} values={boardstate.slice(0,3)} /><br/>
				<TttBoardRow yourTurn={yourTurn} row={1} values={boardstate.slice(3,6)}/><br/>
				<TttBoardRow yourTurn={yourTurn} row={2} values={boardstate.slice(6,9)}/><br/>
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
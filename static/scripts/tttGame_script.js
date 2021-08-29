


const gameId = payload.game.id;
var yourTurn = payload.yourTurn;

function wsSubscribe(clientSocket){
	const subscribeObj = {
		"request": "subscribe", 
		"gameId": gameId,
		"username": payload.username
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
    const clientSocket = new WebSocket("ws://100.1.211.86:5000/websocket")

	clientSocket.onopen = (() => wsSubscribe(clientSocket));

    clientSocket.onmessage = (message) => {
		const data = JSON.parse(message.data);
		if(data.command === "updateBoard"){

			console.log("ws data recv. new activePlayer is " + data.activePlayer)
			if(payload.username == null){
				document.getElementById('status').innerHTML = "spectating";
			}
			else if(payload.username === data.activePlayer){
				document.getElementById('status').innerHTML = "your turn";
			}
			else {
				document.getElementById('status').innerHTML = "waiting for opponent";
			}
			
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);

		}

		else if(data.command == "endGame"){
			if(data.winner == null) {
				console.log("its a tie!");
				document.getElementById('status').innerHTML = "it's a tie";
			}
			else {
				console.log("winner is " + data.winner);

				if(data.winner == payload.username){
					document.getElementById('status').innerHTML = "You won!";
				}
				else if(data.winner == payload.otherPlayer) {
					document.getElementById('status').innerHTML = "You lost...";
				}
				else {
					document.getElementById('status').innerHTML = "game over. Winner: " + data.winner;
				}

				setYourTurn(payload.username === data.activePlayer);
			}
		}

		// TODO MASSIVE REFACTORING NEEDED! 
		//setting the status should be a function, setting innerHTML should be a clean one-liner fn.

		else if(data.command === "info"){
			console.log(data.contents);
			console.log("ws data recv. new activePlayer is " + data.activePlayer)

			

			if(data.gameEnded){
				document.getElementById('status').innerHTML = "Game over.";
				// winner: "you won!"
				if(data.winner == payload.username){
					document.getElementById('status').innerHTML = "You won!";
				}
				else if (data.winner == payload.otherPlayer) {
					document.getElementById('status').innerHTML = "You lost...";
				}

			}
			else {
				if(data.activePlayer == payload.username){
					document.getElementById('status').innerHTML = "Your turn!";
				}
				else if (data.activePlayer == payload.otherPlayer) {
					document.getElementById('status').innerHTML = "waiting for opponent";
				}
				else {
					document.getElementById('status').innerHTML = "spectating";
				}
			}

			
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

function X_Piece(){
	return (
		<svg width="70" height="70" xmlns="http://www.w3.org/2000/svg">
  			<rect x="-6" y="9"   width="10" height="80" rx="5" fill="#f1b42f" transform="rotate(-45)"/>
  			<rect x="43" y="-40" width="10" height="80" rx="5" fill="#f1b42f" transform="rotate(45)"/>
		</svg>
	);
}

function O_Piece(){
	return (
		<svg width="70" height="70" xmlns="http://www.w3.org/2000/svg">
  			<circle cx="35" cy="35" r="27" stroke="#2f6cf1" stroke-width="9" fill="transparent" />
		</svg>
	);
}

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
				{cellItem === "" ? "" : (cellItem === 'X' ? <X_Piece/> : <O_Piece/>)}
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
  				<rect x="166" y="50" width="12" height="400" rx="5" />
				<rect x="330" y="50" width="12" height="400" rx="5"/>
				<rect x="50" y="166" width="400" height="12" rx="5"/>
				<rect x="50" y="330" width="400" height="12" rx="5"/>
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
		<p>Status: <span id="status"></span></p>
		<LogoutButton/>
	</div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv);

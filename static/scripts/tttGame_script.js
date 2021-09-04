


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
	const wsServerHost = payload.wssh;
    const clientSocket = new WebSocket("ws://" + wsServerHost + "/websocket")

	clientSocket.onopen = (() => wsSubscribe(clientSocket));

    clientSocket.onmessage = (message) => {
		const data = JSON.parse(message.data);
		if(data.command === "updateBoard"){

			setStatus(determineStatus(payload, data))
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);

		}

		else if(data.command == "endGame"){
			setStatus(determineStatus(payload, data));
			setYourTurn(payload.username === data.activePlayer);
		}

		else if(data.command === "info"){
			setStatus(determineStatus(payload, data));
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

function setStatus(status){
	document.getElementById('status').innerHTML = status;
}

function determineStatus(payload, data){
	
	var retval = "";
	if(data.gameEnded){
		retval+="Game over. ";
		if(data.winner==null){
			retval+="It's a tie.";
		}
		else{
			if(payload.username==data.winner) 
				retval+="You win!";
	
			else if(payload.username==data.otherPlayer) 
				retval+="You lose...";
			
			else
				retval+="Winner was " + data.winner;
		}
	}
	else{
		switch(payload.username){
			case data.activePlayer:
				retval+="Your turn."; break;
			case data.otherPlayer:
				retval+="Waiting for opponent..."; break;
			default:
				retval+= "spectating";
		}
	}
	return retval;

	/* 
	
	fields we have: gameEnded, winner, otherPlayer, activePlayer
	
	here are all the different statuses.

	4. game over. <player> won  :: gameEnded==true and winner==null
	5. game over. you lose...	:: gameEnded==true and winner==otherPlayer and username==player
	6. game over. you win!		:: gameEnded==true and winner==username
	7. game over. its a tie		:: 

	1. your turn 				:: 
	2. waiting for opponent 	:: 
	3. spectating 				:: 
	


	factors we need to determine the status:
		- username of reader, if any
		- active player, if any
		- winner, if any
		- 


	*/
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
  			<circle cx="35" cy="35" r="27" stroke="#2f6cf1" strokeWidth="9" fill="transparent" />
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
				style={{left: 15+(index*29) + "%", top: 15+(row*29) + "%"}}
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
	<div id="reactRoot">
		<SiteHeader username={payload.username}/>
		<TttBoard/>
		<p>Status: <span id="status"></span></p>
	</div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv);

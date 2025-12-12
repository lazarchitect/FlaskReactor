import React from 'react'; // used by Webpack
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './commonComponents/SiteHeader';
import { Chatbox } from './commonComponents/Chatbox';

const gameId = payload.game.id;

function tttSocketSubscribe(tttSocket) {
	const subscribeObj = {
		"request": "subscribe",
		"ws_token": payload.ws_token,
		"gameId": gameId,
		"username": payload.username
	};
	const subscribeJSON = JSON.stringify(subscribeObj);
	tttSocket.send(subscribeJSON);
}

function tttSocketUpdate(tttSocket, boardIndex) {
	const updateObj = {
		"request": "update", 
		"ws_token": payload.ws_token,
		"gameId": gameId, 
		"gameType": "ttt", 
		"player": payload.username, 
		"boardIndex": boardIndex,
		"userId": payload.userId
	};
	const updateStr = JSON.stringify(updateObj);
    tttSocket.send(updateStr);
}

function tttSocketConnect(setBoardstate, setYourTurn) {
	
    const tttSocket = new WebSocket(payload.wsBaseUrl + "/ttt")
	const statSocket =new WebSocket(payload.wsBaseUrl + "/stat")

	tttSocket.onopen = (() => tttSocketSubscribe(tttSocket));

    tttSocket.onmessage = (message) => {
		const data = JSON.parse(message.data);
		if(data.command === "updateBoard"){

			setStatus(determineStatus(payload, data))
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);

		}

		else if(data.command == "endGame") {
			setStatus(determineStatus(payload, data));
			setYourTurn(payload.username === data.activePlayer);
			// call out to server - update this user's stats
			const messageObj = {
				"request": "updateStat",
				"ws_token": payload.ws_token,
				"gameType": "ttt",
				"gameId": gameId,
				"userId": payload.userId,
				"username": payload.username
			};
			const message = JSON.stringify(messageObj);
			statSocket.send(message); // TODO wouldnt this send incrementing stat updates for EVERYONE currently connected?? socketHandler should check who the user is?
		}

		else if(data.command === "info") {
			setStatus(determineStatus(payload, data));
		}

		else if(data.command === "error") {
			console.log(data.contents);
		}

    };

    var board = document.getElementById("tttBoard");
    board.onclick = function(mouseClick){
		if(mouseClick.target.className != "tttCell activeTttCell") return;
    	console.log("click detected: sending message to socketServer.");
		const boardIndex = mouseClick.target.id;
		tttSocketUpdate(tttSocket, boardIndex);
    };
}

function setStatus(status){
	document.getElementById('status').innerHTML = status;
}

/*
returns the updated status string,
which gets displayed to the user at all times.
*/
function determineStatus(payload, data) {
	
	var retval = "";
	if(data.gameEnded){
		retval+="Game over. ";
		if(data.winner==null) {
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
		switch(payload.username) {
			case data.activePlayer:
				retval+="Your turn."; break;
			case data.otherPlayer:
				retval+="Waiting for opponent..."; break;
			default:
				retval+= "spectating";
		}
	}
	return retval;

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

function TttBoardRow({yourTurn, row, values}){
	// values will look like ["X", "X", "O"]. each is a cellItem
    console.log(values);
	return (values).map((cellItem, index) =>
			<span 
				key={index} 
				className={"tttCell" + ((yourTurn && cellItem === "" && payload.username !== "") ? " activeTttCell": "")}
				id={index+(row*3)}
				style={{left: 15+(index*29) + "%", top: 15+(row*29) + "%"}}
			>
				{cellItem === "" ? "" : (cellItem === 'X' ? <X_Piece/> : <O_Piece/>)}
			</span>
	);
}

function TttBoard(){

	const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);

	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn); 
	
	React.useEffect(() => tttSocketConnect(setBoardstate, setYourTurn), []);

	return (
		<div id="tttBoard">
			
			<svg id="octothorpe" width="500px" height="500px" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  				<rect x="166" y="50" width="12" height="400" rx="5" />
				<rect x="330" y="50" width="12" height="400" rx="5"/>
				<rect x="50" y="166" width="400" height="12" rx="5"/>
				<rect x="50" y="330" width="400" height="12" rx="5"/>
			</svg>
			<div id="tttBoardData">
				<TttBoardRow yourTurn={yourTurn} row={0} values={boardstate.slice(0,3)}/><br/>
				<TttBoardRow yourTurn={yourTurn} row={1} values={boardstate.slice(3,6)}/><br/>
				<TttBoardRow yourTurn={yourTurn} row={2} values={boardstate.slice(6,9)}/><br/>
			</div>
		</div>
	)
}

var isPlayer = payload.players.includes(payload.username);

var page = (
	<div id="reactRoot">
		<SiteHeader version={payload.deployVersion} username={payload.username}/>

		<div id="tttPlayArea">
			<TttBoard/>
			<p>Status: <span id="status"></span></p>
		</div>
		{isPlayer && <Chatbox expanded={false}/>}
	</div>
);

createRoot(document.getElementById('root')).render(page);
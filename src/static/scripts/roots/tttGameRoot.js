import React from 'react'; // used by Webpack
import { createRoot } from 'react-dom/client';
import { SiteHeader } from '../components/common/SiteHeader';
import { Chatbox } from '../components/common/Chatbox';

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

		else if(data.command === "endGame") {
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
			statSocket.send(message); // TODO wouldn't this send incrementing stat updates for EVERYONE currently connected?? socketHandler should check who the user is?
		}

		else if(data.command === "info") {
			setStatus(determineStatus(payload, data));
		}

		else if(data.command === "error") {
			console.log(data.contents);
		}

    };

	const board = document.getElementById("tttBoard");
	board.onclick = function(mouseClick){
		if(mouseClick.target.className !== "tttCell activeTttCell") return;
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

	let retval = "";
	if(data.gameEnded){
		retval+="Game over. ";
		if(data.winner==null) {
			retval+="It's a tie.";
		}
		else{
			if(payload.username === data.winner)
				retval+="You win!";
	
			else if(payload.username === data.otherPlayer)
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

function TttBoardRow({yourTurn, rowIndex, values}){
	// values is an array containing three cell data, e.g. ["X", "X", "O"]
    return (values).map((cellContents, colIndex) =>
			<span 
				key={colIndex}
				className={"tttCell" + ((yourTurn && cellContents === "" && payload.username !== "") ? " activeTttCell": "")}
				id={colIndex+(rowIndex*3)}
				style={{left: 7+(colIndex*34) + "%", top: 7+(rowIndex*35) + "%"}}
			>
				{cellContents === "" ? "" : (cellContents === 'X' ? <X_Piece/> : <O_Piece/>)}
			</span>
	);
}

function TttBoard(){

	const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);

	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn); 
	
	React.useEffect(() => tttSocketConnect(setBoardstate, setYourTurn), []);

	return (
		<div id="tttBoard">
			
			<svg id="octothorpe" width="400px" height="400px" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  				<rect x="125" y="0" width="12" height="400" rx="5" />
				<rect x="263" y="0" width="12" height="400" rx="5"/>
				<rect x="0" y="125" width="400" height="12" rx="5"/>
				<rect x="0" y="263" width="400" height="12" rx="5"/>
			</svg>
			<div id="tttBoardData">
				<TttBoardRow yourTurn={yourTurn} rowIndex={0} values={boardstate.slice(0,3)}/><br/>
				<TttBoardRow yourTurn={yourTurn} rowIndex={1} values={boardstate.slice(3,6)}/><br/>
				<TttBoardRow yourTurn={yourTurn} rowIndex={2} values={boardstate.slice(6,9)}/><br/>
			</div>
		</div>
	)
}

const isPlayer = payload.players.includes(payload.username);

const page = (
	<>
		<SiteHeader />
		<main>
			<div className="playArea">
				<TttBoard/>
				<p>Status: <span id="status"></span></p>
			</div>
			{isPlayer && <Chatbox expanded={false}/>}
		</main>
	</>
);

createRoot(document.getElementById('root')).render(page);
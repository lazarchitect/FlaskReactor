/* contains all JS, react or otherwise, that creates and maintains the home.html template. */

'use strict';

import React from 'react'; // do I need this?
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './CommonComponents';
import styled  from 'styled-components';

var chessGames = payload.chessGames;
var username = payload.username;
var tttGames = payload.tttGames;

const GameDiv = styled.div`
	background-color: #bbb;
	margin: 10px;
	text-align: center;
	padding: 10px 0;
	border: 2px solid blue;
	width: 100px;
	height: 50px;
	border-radius: 10px
`;

function openGame(gameId, gameType){
	window.location.href = "/games/" + gameType + "/" + gameId;
}

// chessGames comes from Flask -> html script
var activeChessGames = chessGames.map((game) => 

	game[4] == false ?

		<GameDiv className="chessGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], "chess")}>
			{"Vs. " + (game[1] === username ? game[2] : game[1])}
		</GameDiv>
	: ""
);

var activeTTTGames = tttGames.map((game) => {

	let completed = game[3];
	
	if (!completed) {
		return (<GameDiv className="tttGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], "ttt")}>
				{"Vs. " + (game[1] === username ? game[2] : game[1])}
			</GameDiv>);
	}
	return "";
	}
);

var completedTTTGames = tttGames.map((game) => {

	let completed = game[3];
	
	if (completed) {
		return (<GameDiv className="tttGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], "ttt")}>
				{"Vs. " + (game[1] === username ? game[2] : game[1])}
			</GameDiv>);
	}
	return "";
	}
);

const gameTypes = ["Chess", "Tic-Tac-Toe"]; 

const jsxGT = gameTypes.map((gameType) => <option key={gameType} value={gameType}>{gameType}</option>);

var page = (

	<div id="reactRoot">
		<SiteHeader version={payload.deployVersion} username={payload.username}/>

		<form action="/creategame" method="POST" id="createGameDiv">
			<h4>Create Game</h4>
			
			
			<select name="gameType"> {/*The name attribute is used to reference the form data*/}
  				{jsxGT}
			</select>
			<br/>
			
			Opponent Username: <input type="text" name="opponent" required /> 
			<input type="submit" value="Create" />
		</form>

		<h4>Chess Games:</h4> {activeChessGames}

		View Past Games? <input type="checkbox" id="viewPastChessGames"/>

		<h4>TicTacToe Games:</h4> {activeTTTGames}

		View Past Games? <input type="checkbox" id="viewPastTttGames"/>

		{document.getElementById('viewPastTttGames').checked ? completedTTTGames : ""}

		// TODO react should manage the state of the games divs and we call setState when the checkboxes are clicked 

	</div>
);

let rootElement = document.getElementById('root');
let reactRoot = createRoot(rootElement);
reactRoot.render(page);
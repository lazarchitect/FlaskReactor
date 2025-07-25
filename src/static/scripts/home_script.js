/* contains all JS, react or otherwise, that creates and maintains the home.html template. */

'use strict';

import React, { StrictMode } from 'react'; // do I need this?
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './CommonComponents';
import styled from 'styled-components';

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

function ChessGameList (props) {
	return chessGames
	.filter(game => game[4] == props.completed)
	.map(game => 
		<GameDiv className="chessGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], "chess")}>
			{"Vs. " + (game[1] === username ? game[2] : game[1])}
		</GameDiv>
	);
}

function ChessGames (props) {

	React.useEffect(() => enableOnClick("Chess"), []);

	return (
		<div>
			<h4>Chess Games:</h4>			
			<ChessGameList completed={false}/>
			Show Past Games? <input type="checkbox" id="viewPastChessGames"/>
			<div id="pastChessGames">
				<ChessGameList completed={true}/>
			</div>
		</div>
	);
}

function TttGameList (props) {
	return tttGames
	.filter(game => game[3] == props.completed)
	.map(game => 

		<GameDiv tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], "ttt")}>
			{"Vs. " + (game[1] === username ? game[2] : game[1])}
		</GameDiv>
	);
}

function enableOnClick(gamemode) {
	document.getElementById("viewPast"+gamemode+"Games").onclick = (() => {

		let pastGames = document.getElementById("past"+gamemode+"Games");

		let currentVisbility = pastGames.style.visibility;
		let newVisibility = (currentVisbility == 'visible' ? 'hidden' : 'visible');
		pastGames.style.visibility = newVisibility;

		let currentPosition = pastGames.style.position;
		let newPosition = (currentPosition == 'static' ? 'absolute' : 'static');
		pastGames.style.position = newPosition;
	});
}

function TttGames (props) {

	React.useEffect(() => enableOnClick("Ttt"), []);

	return (
		<div>
			<h4>TicTacToe Games:</h4>
			<TttGameList completed={false}/>
			Show Past Games? <input type="checkbox" id="viewPastTttGames"/>
			<div id="pastTttGames">
				<TttGameList completed={true}/>
			</div>
		</div>
	);
}



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
			
			Opponent Username: <input type="text" name="opponent"/> 
			<input type="submit" value="Create"/>
		</form>

		<ChessGames/>
		<TttGames/>

		{/* TODO react should manage the state of the games divs and we call setState when the checkboxes are clicked  */}

	</div>
);

let rootElement = document.getElementById('root');
let reactRoot = createRoot(rootElement);
reactRoot.render(page);
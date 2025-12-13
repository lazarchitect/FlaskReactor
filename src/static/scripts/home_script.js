/* Script to build the home.html template. */

'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {SiteHeader} from './commonComponents/SiteHeader';
import styled from 'styled-components';

const username = payload.username;

const quadradiusGames = payload.quadradiusGames;
const chessGames = payload.chessGames;
const tttGames = payload.tttGames;

const GameDiv = styled.div`
	background-color: peachpuff;
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

function QuadradiusGameList ({completed}) {
    return quadradiusGames
	.filter(game => game.completed === completed)
	.map(game => 
		<GameDiv className="quadradiusGame" tabIndex={0} key={game['id']} onClick={() => openGame(game['id'], "quadradius")}>
			{"Vs. " + (game.player1 === username ? game.player2 : game.player1)}
		</GameDiv>
	);
}

function QuadradiusGames () {

	React.useEffect(() => enableOnClick("Quadradius"), []);

	return (
		<div>
			<h4>Quadradius Games:</h4>			
			<QuadradiusGameList completed={false}/>
			Show Past Games? <input type="checkbox" id="viewPastQuadradiusGames"/>
			<div id="pastQuadradiusGames">
				<QuadradiusGameList completed={true}/>
			</div>
		</div>
	);
}

function ChessGameList ({completed}) {
	return chessGames
	.filter(game => game.completed === completed)
	.map(game =>
		<GameDiv className="chessGame" tabIndex={0} key={game.id} onClick={() => openGame(game.id, "chess")}>
			{"Vs. " + (game.white_player === username ? game.black_player : game.white_player)}
		</GameDiv>
	);
}

function ChessGames () {

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

function TttGameList ({completed}) {
	return tttGames
	.filter(game => game['completed'] === completed)
	.map(game => 

		<GameDiv tabIndex={0} key={game['id']} onClick={() => openGame(game['id'], "ttt")}>
			{"Vs. " + (game['x_player'] === username ? game['o_player'] : game['x_player'])}
		</GameDiv>
	);
}

function enableOnClick(gameMode) {
	document.getElementById("viewPast"+gameMode+"Games").onclick = (() => {

		let pastGames = document.getElementById("past"+gameMode+"Games");

		let currentVisibility = pastGames.style.visibility;
        pastGames.style.visibility = (currentVisibility === 'visible' ? 'hidden' : 'visible');

		let currentPosition = pastGames.style.position;
        pastGames.style.position = (currentPosition === 'static' ? 'absolute' : 'static');
	});
}

function TttGames () {

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



const gameTypes = ["Chess", "Tic-Tac-Toe", "Quadradius"]; 

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

		<QuadradiusGames/>
		<ChessGames/>
		<TttGames/>

	</div>
);

let rootElement = document.getElementById('root');
let reactRoot = createRoot(rootElement);
reactRoot.render(page);
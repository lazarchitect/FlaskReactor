/* Script to build the home.html template. */

'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import styled from 'styled-components';

const {quadGames, chessGames, tttGames} = payload;

// games are displayed in the order listed in this object
const gameDefs = Object.freeze({
	"Quad":  {displayName: "Quadradius",  games: quadGames },
	"Chess": {displayName: "Chess", 	  games: chessGames},
	"Ttt":   {displayName: "Tic-Tac-Toe", games: tttGames  }
});
const gameTypes = Object.keys(gameDefs);

const GameDiv = styled.div`
	background-color: peachpuff;
	margin: 10px;
	text-align: center;
	padding: 10px 0;
	border: 2px solid blue;
	border-radius: 10px`;

function openGame(gameId, gameType){
	window.location.href = "/games/" + gameType.toLowerCase() + "/" + gameId;
}

function determineOpponentName(gameType, game) {
	const you = payload.username;
	switch (gameType) {
		case "Chess": return (game.white_player === you ? game.black_player : game.white_player);
		case "Quad": return (game.player1 === you ? game.player2 : game.player1);
		case "Ttt": return (game.x_player === you ? game.o_player : game.x_player);
	}
}

function GameList ({isCompleted, gameType}) {
	return gameDefs[gameType].games
		.filter(game => game.completed === isCompleted)
		.map(game =>
			<GameDiv tabIndex={0} key={game.id} onClick={() => openGame(game.id, gameType)}>
				{"Vs. " + determineOpponentName(gameType, game)}
			</GameDiv>
		);
}

function GameDisplay ({gameType}) {

	let [showPastGames, setShowPastGames] =	React.useState(false);

	const toggleShowPastGames = () => {setShowPastGames(!showPastGames)};

	const displayName = gameDefs[gameType].displayName;

	return (
		<div className="gameDisplay">
			<h4>{displayName} Games:</h4>
			<GameList gameType={gameType} isCompleted={false}/>
			<label htmlFor={"viewPast" + gameType + "Games"}> Show Past Games? </label>
			<input type="checkbox" id={"viewPast" + gameType + "Games"} onChange={toggleShowPastGames}/>

			{showPastGames && <GameList gameType={gameType} isCompleted={true}/>}
		</div>
	);
}

function CreateGameArea() {

	document.addEventListener("keyup", e => {
		const opponentName = document.getElementById("opponentName").value;
		document.getElementById("submitCreateGame").disabled = opponentName.length === 0;
	});

	return <form action="/create-game" method="POST" id="createGameDiv">
		<h4>Create Game</h4>

		<select name="gameType"> {/*The name attribute is used to reference the form data*/}
			{gameTypes.map((type) => <option key={type} value={type}>{gameDefs[type].displayName}</option>)}
		</select>
		<br/>

		Opponent Username: <input type="text" name="opponent" id="opponentName" />

		<input type="submit" value="Create" id="submitCreateGame" disabled />
	</form>;
}

const page = (
	<>
		<SiteHeader/>
		<main>
			<CreateGameArea />

			<div id="gameDisplaysArea">
				{gameTypes.map((gameType) =>
					<GameDisplay key={gameType} gameType={gameType} />
				)}
			</div>

		</main>
	</>
);

const rootElement = document.getElementById('root');
const reactRoot = createRoot(rootElement);
reactRoot.render(page);
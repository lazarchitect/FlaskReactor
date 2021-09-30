/* contains all JS, react or otherwise, that creates and maintains the home.html template. */

var username = payload.username;

var activeChessGames = payload.activeChessGames;
var activeTttGames   = payload.activeTttGames;
var completedChessGames = payload.completedChessGames;
var completedTttGames   = payload.completedTttGames;

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

function gameList(games, type){
	return games.map((game) => 
		<GameDiv className={type+"Game"} tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0], type)}>
			{"Vs. " + (game[1] === username ? game[2] : game[1])}
		</GameDiv>
	);
}

var activeChessGameList = gameList(activeChessGames, "chess");
var activeTttGameList = gameList(activeTttGames, "ttt");
var completedChessGameList = gameList(completedChessGames, "chess");
var completedTttGameList = gameList(completedTttGames, "ttt");


const gameTypes = ["Chess", "Tic-Tac-Toe"]; 

const jsxGT = gameTypes.map((gameType) => <option key={gameType} value={gameType}>{gameType}</option>);

var rootElem = (

	<div id="reactRoot">
		<SiteHeader username={payload.username}/>
		<br/>
		<form action="/creategame" method="POST" id="createGameDiv">
			<h4>Create Game</h4>
			
			
			<select name="gameType"> {/*The name attribute is used to reference the form data*/}
  				{jsxGT}
			</select>
			<br/>
			
			Opponent Username: <input type="text" name="opponent"/> 
			<input type="submit" value="Create"/>
		</form>

		<h1>Games</h1>
		<div>
			{/* TODO display actives or completeds based on status of this here div and anchors. */}
			<div> <a>ACTIVE</a> | <a>COMPLETED</a> </div>
			Chess Games: {activeChessGameList}
			TicTacToe Games: {activeTttGameList}
		</div>

	</div>

);


var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv)
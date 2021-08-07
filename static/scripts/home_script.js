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

function openGame(gameId){
	window.location.href = "/games/" + gameId; // TODO change to /games/chess/<ID>
}

// chessGames comes from Flask -> html script
var chessGameList = chessGames.map((game) => 
	<GameDiv className="chessGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0])}>
		{"Vs. " + (game[1] === username ? game[2] : game[1])}
	</GameDiv>
);

// var TTTGameList = tttGames.map((game) => 
// 	<gameDiv className="tttGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0])}>
// 		{"Vs. " + (game[1] === username ? game[2] : game[1])}
// 	</gameDiv>
// );

var rootElem = (

	<div>

		<form id="logoutButton" action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>

		<form action="/creategame" method="POST">
			<p>Create Game</p>
			Opponent Username: <input type="text" name="opponent"/> <input type="submit" value="Create"/>
		</form>

		Chess Games: {chessGameList}

		{/* TicTacToe Games: {TTTGameList} */}


	</div>

);


var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv)
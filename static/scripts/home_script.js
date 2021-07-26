const ChessGame = styled.div`
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
	window.location.href = "/games/" + gameId;
}

var chessGameList = games.map((game) => 
	<ChessGame className="chessGame" tabIndex={"0"} key={game[0]} onClick={() => openGame(game[0])}>
		{"Vs. " + (game[1] === username ? game[2] : game[1])}
	</ChessGame>
);

var elem = (

	<div>

		<form id="logoutButton" action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>

		<form action="/creategame" method="POST">
			<p>Create Game</p>
			Opponent Username: <input type="text" name="opponent"/> <input type="submit" value="Create"/>
		</form>

		{chessGameList}
	</div>

);


var rootDiv = document.getElementById("root");

ReactDOM.render(elem, rootDiv)
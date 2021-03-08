const ChessGame = styled.div`
	background-color: #ff2233;
	width: 100px;
	height: 50px
`;

var chessGameList = games.map((game) => 
	<ChessGame key={game[0]}>{"Game ID: " + game[0]}</ChessGame>
);

var elem = (

	<div>

		<form action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>

		<form action="/creategame" method="POST">
			Opponent Username: <input type="text" name="opponent"/>
			<br/>
			<input type="submit" value="Create"/>
		</form>

		{chessGameList}
	</div>

);


var rootDiv = document.getElementById("root");

ReactDOM.render(elem, rootDiv)
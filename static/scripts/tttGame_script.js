
var boardstate = payload.boardstate;

// sample boardstate
// ['X', '', 'O', 'O', '', 'X', '', '', '']

// TODO DELETE THIS AFTER DEVELOPMENT
boardstate = ['X', 'X', 'O', 'O', 'X', 'X', 'O', 'X', 'O'];

function TttBoardRow(props){
	return (boardstate.slice(props.start, props.end)).map(
		(cellItem, index) => <span key={index} className="tttCell">{cellItem}</span>
	);
}

function TttBoard(){
	return (
		<div id="tttBoard">
			<TttBoardRow start={0} end={3}/><br/>
			<TttBoardRow start={3} end={6}/><br/>
			<TttBoardRow start={6} end={9}/><br/>
		</div>
	)
}

var rootElem = (
	<div id="page">
		<TttBoard/>
		<form id="logoutButton" action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>
	</div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv);
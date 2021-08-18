
var boardstate = payload.boardstate;

// TODO DELETE THIS AFTER DEVELOPMENT
boardstate = ['X', 'X', 'O', 'O', 'X', 'X', 'O', 'X', 'O'];

function TttBoardRow(props){
	const row = props.row;
	return (boardstate.slice(props.start, props.end)).map((cellItem, index) => 
			<span 
			key={index} 
			className="tttCell" 
			style={{left: ((15*index)+(index+1)*60) + "px", top: (40 + (row*-26) + row*60) + "px"}}>
				{cellItem}
			</span>
	);
}

function TttBoard(){
	return (
		<div id="tttBoard">
			<TttBoardRow row={0} start={0} end={3}/><br/>
			<TttBoardRow row={1} start={3} end={6}/><br/>
			<TttBoardRow row={2} start={6} end={9}/><br/>
			<svg id="octothorpe" width="500px" height="500px" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" z-index={0}>
  				<rect className="rectLine" x="166" y="50" width="12" height="400" />
				<rect className="rectLine" x="330" y="50" width="12" height="400" />
				<rect className="rectLine" x="50" y="166" width="400" height="12" />
				<rect className="rectLine" x="50" y="330" width="400" height="12" />
			</svg>
		</div>
	)
}

var rootElem = (
	<div id="tttGamePage">
		<TttBoard/>
		<form id="logoutButton" action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>
	</div>
);

var rootDiv = document.getElementById("root");

ReactDOM.render(rootElem, rootDiv);
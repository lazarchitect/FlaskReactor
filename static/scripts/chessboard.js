function wsConnect(setBoardstate, setYourTurn) {
	// const clientSocket = new WebSocket("ws://100.1.211.86:5000/websocket");
	const clientSocket = new WebSocket("ws://localhost:5000/websocket");
		
	clientSocket.onmessage = (message) => {

		const data = JSON.parse(message.data);
		
		if(data.command == "updateBoard"){
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);
		}

		console.log("Message from server: ", message.data);
	};
	var board = document.getElementsByClassName("board")[0];
	board.onclick = function(mouseEvent){

		const tile = mouseEvent.target.id;
		
		console.log(tile);
	};
}

function Board() {

	const boardArray = payload.boardstate.tiles;
	
	const [boardstate, setBoardstate] = React.useState(boardArray);
	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn);

	React.useEffect(() => wsConnect(setBoardstate, setYourTurn), []);

	return (
		<div className="board">
			{boardArray.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val}></Row>)}
		</div>
	);		
}

function Row(props){	
		
	var darkTile = props.rowIndex % 2 == 0 ? false : true;
		
	var reactTileArray = []
	for(var tileIndex = 0; tileIndex < props.tiles.length; tileIndex++) {
		reactTileArray.push(
			<Tile key={tileIndex} darkTile={darkTile} rowIndex={props.rowIndex} tileIndex={tileIndex} data={props.tiles[tileIndex]}/>
		)
		darkTile = !darkTile
	}

	return (
		<div className="chessRow">
			{reactTileArray}
		</div>
	);
}

function Tile(props) {
	var tileId = props.tileIndex.toString() + props.rowIndex.toString();

	return (
		<span 
			key = {props.tileIndex.toString() + props.rowIndex.toString()}
			className = {props.darkTile ? "tile darkTile" : "tile lightTile"}
			id = {tileId} 
		>
			{/* tile contents */}
			<img className="pieceImg" src={imagePath(props.data)} />
		
		</span>
	);
}

function imagePath(data){
	if(data.piece == null) return "";
	
	return "/static/images/" + data.piece.color + data.piece.type + ".png"	
}

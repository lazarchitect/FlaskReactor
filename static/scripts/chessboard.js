function wsConnect(boardstate, setBoardstate) {
	// const clientSocket = new WebSocket("ws://100.1.211.86:5000/websocket");
	const clientSocket = new WebSocket("ws://localhost:5000/websocket");
		
	clientSocket.onmessage = (message) => {

		// TODO recv new boardstate from server (which was based on current boardstate and move) and do setBoardstate

		console.log("Message from server: ", message.data);
	};
	var board = document.getElementsByClassName("board")[0];
	board.onclick = function(mouseEvent){
		console.log("click detected: sending message to socketServer.");
		const tile = mouseEvent.target.id;
		const piece = getPieceAt(tile, boardstate); // row A column 2? ... its a black pawn!
		if(highlight){
			clientSocket.send({
				"gameId": payload.gameId,
				"src": "",
				"dest": "",
				"player": "Josh11"
			});
		}
		else {
			// do nothing socket-wise tbh
		}
	};
}


function Board() {

	var boardArray = payload.boardstate.tiles;

	[boardstate, setBoardstate] = React.useState(boardArray);

	React.useEffect(() => wsConnect(setBoardstate), []);

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


var highlight = false;
var initialBoardstate = payload.boardstate;

function pieceAt(tileId){
	return boardstate[tileId[1]][tileId[0]];
}

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
	
		const tileId = mouseEvent.target.id;

		const piece = pieceAt(tileId);

		if(highlight == false){
			if (piece == null) return;
			if(piece.color != payload.color) return;

			
		}
		else {

		}

		console.log(tileId);
	};
}

function Board() {
	
	const [boardstate, setBoardstate] = React.useState(boardstate);
	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn);

	React.useEffect(() => wsConnect(setBoardstate, setYourTurn), []);

	return (
		<div className="board">
			{boardstate.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val}></Row>)}
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
		
	const piece = props.data.piece;
	const imagePath = piece == null ? "" : "/static/images/" + piece.color + piece.type + ".png";

	return (
		<span 
			key = {props.tileIndex.toString() + props.rowIndex.toString()}
			className = {props.darkTile ? "tile darkTile" : "tile lightTile"}
			id = {props.tileIndex.toString() + props.rowIndex.toString()} 
		>
			{/* tile contents */}
			<img className="pieceImg" src={imagePath} />
			
		</span>
	);
}
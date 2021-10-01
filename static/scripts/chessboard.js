
var highlight = false;

function wsConnect(boardstate, setBoardstate, setYourTurn) {
	// const clientSocket = new WebSocket("ws://100.1.211.86:5000/ws/chess");
	const clientSocket = new WebSocket("ws://localhost:5000/ws/chess");
		
	clientSocket.onmessage = (message) => {

		const data = JSON.parse(message.data);
		
		if(data.command == "updateBoard"){
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);
		}

		console.log("Message from server: ", message.data);
	};

	var board = document.getElementById("board");
	
	board.onclick = function(mouseEvent){

		if(!payload.yourTurn) return;

		const tileId = mouseEvent.target.id;
		const piece = boardstate[tileId[1]][tileId[0]].piece;

		if (piece == null) return;

		console.log(piece);

		// TODO handle highlight logic.
		//highlight is false? clicking on a piece generates the highlights.
		// highlight is true, and the tile is highlighted? (each tile now needs a highlight boolean) then execute the move.


		if(piece.color == payload.userColor){
			console.log("thats your piece!");
		}

	};
}

function Board() {
	
	const [boardstate, setBoardstate] = React.useState(payload.boardstate);
	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn);

	React.useEffect(() => wsConnect(boardstate, setBoardstate, setYourTurn), []);

	return (
		<div id="board">
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
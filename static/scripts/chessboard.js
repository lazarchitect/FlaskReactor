var highlightedTiles = [];
var active_coords = [];

const gameId = payload.game.id;
var yourTurn = payload.yourTurn;

function wsSubscribe(chessSocket){
	const subscribeObj = {
		"request": "subscribe", 
		"gameId": gameId,
		"username": payload.username
	};
	const subscribeStr = JSON.stringify(subscribeObj);
	chessSocket.send(subscribeStr);
}

function wsUpdate(chessSocket, tileId){
	const updateObj = {
		"request": "update", 
		"gameId": payload.game.id,
		"player": payload.player,
		"userId": payload.userId,
		"src": active_coords[1] +""+ active_coords[0],
		"dest": tileId
	}
	const updateStr = JSON.stringify(updateObj);
	chessSocket.send(updateStr);
}

function wsConnect(boardstate, setBoardstate, setYourTurn) {
	const webSocketServerHost = payload.wssh;
	const chessSocket = new WebSocket("ws://" + webSocketServerHost + "/ws/chess");

	chessSocket.onopen = (() => wsSubscribe(chessSocket));

	chessSocket.onmessage = (message) => {

		const data = JSON.parse(message.data);
		
		if(data.command == "updateBoard"){
			setBoardstate(data.newBoardstate);
			setYourTurn(payload.username === data.activePlayer);
			boardstate = data.newBoardstate;
			console.log(boardstate);
		}

		// console.log("Message from server: ", message.data);
	};

	var board = document.getElementById("board");
	
	board.onclick = function(mouseEvent){

		if(!payload.yourTurn) return;

		const tileId = mouseEvent.target.id;
		const row = parseInt(tileId[1]);
		const col = parseInt(tileId[0]);
		const coord = row +""+ col;
		const tile = boardstate[row][col]
		const piece = tile.piece;

		if(!highlightedTiles.includes(coord)){
			
			removeHighlights();

			if(piece == undefined || piece == null || piece.color != payload.userColor) return;
			
			generateHighlights(boardstate, tile, piece);

		}
		else {
			// TODO send this move command to the server. return unless the server deems it valid.
			wsUpdate(chessSocket, tileId);
		}

	};
}

function removeHighlights(){
	active_coords = [];
	highlightedTiles.forEach(coords => {
		var tileDiv = document.getElementById(coords[1]+""+coords[0]);
		tileDiv.classList.remove("darkHighlighted");
		tileDiv.classList.remove("lightHighlighted");
	});
}

function generateHighlights(boardstate, tile, piece){ // void
	
	highlightedTiles = [];
	active_coords = [piece.row, piece.col];
	
	console.log("piece type: " + piece.type);

	if(piece.type == "Pawn"){
		const whiteDirection = -1;
		const blackDirection =  1;
		const pieceDirection = piece.color == "Black" ? blackDirection : whiteDirection;
		const finalRow = piece.color == "Black" ? 7 : 0;
        const starterRow = piece.color == "Black" ? 1 : 6;

		const row = piece.row;
		if(row == finalRow) return; // will never happen under promotion
		
		// advance 1
		if(boardstate[piece.row+pieceDirection][piece.col].piece == undefined){
			highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col);
		}
		if(row == starterRow && boardstate[piece.row+(pieceDirection*2)][piece.col].piece == undefined){
			highlightedTiles.push((piece.row+pieceDirection*2) + "" + piece.col);
		}
	}

	
	for(var index in highlightedTiles){
		const coordinate = highlightedTiles[index];
		const tileDiv = document.getElementById(coordinate[1]+""+coordinate[0]);
		if(tileDiv.classList.contains("darkTile")){
			tileDiv.classList.add("darkHighlighted");
		}
		else {
			tileDiv.classList.add("lightHighlighted");
		}
		
	}

}

function Chessboard() {
	
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
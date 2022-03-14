var highlightedTiles = [];
var active_coords = [];

const knightOffsets = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
const bishopOffsets = [[1,1],[1,-1],[-1,1],[-1,-1]];
const rookOffsets = [[0,1],[0,-1],[1,0],[-1,0]];
const royalOffsets = [[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]];

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
		}
	};

	var board = document.getElementById("board");
	
	board.onclick = function(mouseEvent){


		if(!payload.yourTurn) return;

		const tileId = mouseEvent.target.id;
		const col = parseInt(tileId[0]);
		const row = parseInt(tileId[1]);

		if(isNaN(col) || isNaN(row)){console.log("invalid tileId");return;}

		const coord = row +""+ col;
		const tile = boardstate[row][col]
		const piece = tile.piece;
		if(!highlightedTiles.includes(coord)){

			removeHighlights();

			if(piece == undefined || piece == null || piece.color != payload.userColor) return;
			
			generateHighlights(boardstate, tile, piece);

		}
		else {
			wsUpdate(chessSocket, tileId);
			removeHighlights();
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
	highlightedTiles = [];
}

function generateHighlights(boardstate, tile, piece){ // void
	
	highlightedTiles = [];
	active_coords = [piece.row, piece.col];

	const enemyColor = piece.color == "Black" ? "White" : "Black";
	
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
		// advance 2
		if(row == starterRow 
			&& boardstate[piece.row+pieceDirection][piece.col].piece == undefined
			&& boardstate[piece.row+(pieceDirection*2)][piece.col].piece == undefined){
			highlightedTiles.push((piece.row+pieceDirection*2) + "" + piece.col);
		}
		// attack left
		const leftTargetTile = boardstate[piece.row+pieceDirection][piece.col-1];
		if(leftTargetTile != undefined && leftTargetTile.piece != undefined && leftTargetTile.piece.color == enemyColor){
			highlightedTiles.push((piece.row+pieceDirection) + "" + (piece.col-1));
		}
		// attack right
		const rightTargetTile = boardstate[piece.row+pieceDirection][piece.col+1];
		if(rightTargetTile != undefined && rightTargetTile.piece != undefined && rightTargetTile.piece.color == enemyColor){
			highlightedTiles.push((piece.row+pieceDirection) + "" + (piece.col+1));
		}
	}
	
	else if(piece.type == "King"){
		// TODO later: kings cannot move into a check position
		royalOffsets.forEach(offset => {
			const destRow = piece.row+offset[0];
			const destCol = piece.col + offset[1]; 
			
			if(!outOfBounds(destRow, destCol)){
				const targetPiece = boardstate[destRow][destCol].piece;
				if(targetPiece == undefined || targetPiece.color == enemyColor){
					highlightedTiles.push(destRow + "" + destCol);
				}
			}
		});
	}

	else if(piece.type == "Knight"){
		knightOffsets.forEach(offset => {
			const destRow = piece.row+offset[0];
			const destCol = piece.col + offset[1];
			if(!outOfBounds(destRow, destCol)){
				const targetPiece = boardstate[destRow][destCol].piece;
				if(targetPiece == undefined || targetPiece.color == enemyColor){
					highlightedTiles.push(destRow + "" + destCol);
				}
			}
		});
	}

	else if (piece.type == "Rook") {
		highlightedTiles = sliderMoves(piece, boardstate, rookOffsets);
	}
	else if(piece.type == "Bishop") {
		highlightedTiles = sliderMoves(piece, boardstate, bishopOffsets);
	}
	else if(piece.type == "Queen") {
		highlightedTiles = sliderMoves(piece, boardstate, royalOffsets);
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

function outOfBounds(row, col){
	return row < 0 || row > 7 || col < 0 || col > 7;
}

function sliderMoves(piece, boardstate, offsets) {
	let moveList = [];
	
	offsets.forEach(offset => {
		const rowOffset = offset[0];
		const colOffset = offset[1];
		scan(rowOffset, colOffset, piece.row, piece.col, piece.color, boardstate, moveList);
	});
	return moveList;
}

// modify moveList and recurse to the next offset.
function scan(rowOffset, colOffset, row, col, color, boardstate, moveList){
	
	const targetRow = row+rowOffset;
	const targetCol = col+colOffset;

	console.log(targetRow, targetCol);

    // base case: line has exited the board
	if(outOfBounds(targetRow, targetCol)) return;

	// base case: there's a piece in the way.
	const targetPiece = boardstate[targetRow][targetCol].piece;
	if(targetPiece != undefined){
		if(targetPiece.color != color){
			moveList.push(targetRow + "" + targetCol);
		}
		return;
	}

	// empty tile? include and keep going.
	moveList.push(targetRow + "" + targetCol);
	scan(rowOffset, colOffset, row+rowOffset, col+colOffset, color, boardstate, moveList);

}

function Chessboard() {
	
	const [boardstate, setBoardstate] = React.useState(payload.boardstate);
	const [yourTurn, setYourTurn] = React.useState(payload.yourTurn);

	React.useEffect(() => wsConnect(boardstate, setBoardstate, setYourTurn), []);

	return (
		<div id="board">
			{boardstate.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val}/>)}
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

	return <div className="chessRow">{reactTileArray}</div>;
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
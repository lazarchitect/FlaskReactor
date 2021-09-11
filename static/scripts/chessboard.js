function mountBoard() {
	// const clientSocket = new WebSocket("ws://100.1.211.86:5000/websocket");
	const clientSocket = new WebSocket("ws://localhost:5000/websocket");
		
	clientSocket.onmessage = (message) => {
		console.log("Message from server: ", message.data);
	};
	var board = document.getElementsByClassName("board")[0];
	board.onclick = function(){
		console.log("click detected: sending message to socketServer.");
		clientSocket.send("hello, server");
	};
}


function Board(props) {

	React.useEffect(() => mountBoard());

	var boardArray = payload.boardstate.tiles;

	return (
		<div className="board">
			{boardArray.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val}></Row>)}
		</div>
	);		
}

class Row extends React.Component {
	
	render () {
		
		var darkTile = this.props.rowIndex % 2 == 0 ? false : true;
		
		var reactTileArray = []
		for(var tileIndex = 0; tileIndex < this.props.tiles.length; tileIndex++) {
			reactTileArray.push(<Tile key={tileIndex} darkTile={darkTile} rowIndex={this.props.rowIndex} tileIndex={tileIndex} data={this.props.tiles[tileIndex]}/>)
			darkTile = !darkTile
		}

		return (
			<div className="chessRow">
				{reactTileArray}
			</div>
		);
	}
}


class Tile extends React.Component {
	render() {
		
		var tileId = this.props.tileIndex.toString() + this.props.rowIndex.toString();

		var tileDiv = (
		<span 
			key = {this.props.tileIndex.toString() + this.props.rowIndex.toString()}
			className = {this.props.darkTile ? "tile darkTile" : "tile lightTile"}
			id = {tileId} 
		>

			{/* tile contents */}
			<img className="pieceImg" src={this.imagePath(this.props.data)} />
		
		</span>
		);
		return tileDiv;
	}

	imagePath(data){
		if(data.piece == null) return "";
		else {
			return "/static/images/" + data.piece.color + data.piece.type + ".png"
		}
	}
	
}

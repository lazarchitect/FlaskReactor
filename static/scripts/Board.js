
class Board extends React.Component {

	render() {

		var boardArray = gamestate.tiles // comes from flask -> jinja -> clientside scope
		var reactRowArray = []
		for(var i = 0; i < boardArray.length; i++){
			reactRowArray.push(<Row key={i.toString()} rowIndex={i} tiles={boardArray[i]} />);
		}
		return <div className="board">{reactRowArray}</div>
		
	}

	

	componentDidMount(){
		console.log("initializing WS")
        const clientSocket = new WebSocket("ws://localhost:5000/websocket")

        clientSocket.onmessage = (message) => {
			// TODO handle websocket message from server. update board or chat message.
			console.log("Message from server: ", message.data);
        };

        var board = document.getElementsByClassName("board")[0];
        board.onclick = function(){
        	console.log("click detected: sending message to socketServer.");
        	clientSocket.send("hello, server");
        };
	}
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

var columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

class Tile extends React.Component {
	render() {
		
		var tileId = columns[this.props.tileIndex].toString() + (this.props.rowIndex+1);

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
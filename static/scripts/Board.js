
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

        clientSocket.onmessage = (data) => {
			// TODO handle websocket message from server. update board or chat message.
			console.log("Message from server: ", data);
        };

		// console.log(document.body);
        var board = document.getElementsByClassName("board")[0];
        console.log(board);
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

		return reactTileArray
	}
}

var columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

class Tile extends React.Component {
	render() {
		
		var tileId = columns[this.props.tileIndex].toString() + (this.props.rowIndex+1);

		var tileDiv = (
		<div 
			key = {this.props.tileIndex.toString() + this.props.rowIndex.toString()}
			style = {{left: (this.props.tileIndex*60) + "px", top:(this.props.rowIndex*60)+"px"}} 
			className = {this.props.darkTile ? "tile darkTile" : "tile lightTile"}
			id = {tileId}
			onClick = {() => document.getElementById(tileId).style.backgroundColor = "blue"}
		>

			{/* tile contents	 */}
			<span>{this.pieceInitials(this.props.data)}</span>
		
		</div>
		);

		return tileDiv;
	}

	pieceInitials(data){
		if (data.piece == null) return;
		return data.piece.color[0] + data.piece.type[0]
	}
	
}
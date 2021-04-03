
class Board extends React.Component {

	render() {

		var boardArray = gamestate.tiles // comes from flask -> jinja -> clientside scope
		var reactRowArray = []
		for(var i = 0; i < boardArray.length; i++){
			reactRowArray.push(<Row rowIndex={i} tiles={boardArray[i]} />);
			console.log(reactRowArray)
		}
		return <div className="board">{reactRowArray}</div>
	}
    
}

class Row extends React.Component {
	
	render () {
		
		var darkTile = this.props.rowIndex % 2 == 0 ? false : true;
		
		console.log("rendering row " + this.props.rowIndex)

		var reactTileArray = []
		for(var tileIndex = 0; tileIndex < this.props.tiles.length; tileIndex++) {
			reactTileArray.push(<Tile darkTile={darkTile} rowIndex={this.props.rowIndex} tileIndex={tileIndex} data={this.props.tiles[tileIndex]}/>)
			darkTile = !darkTile
		}

		return reactTileArray
	}
}

var columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

class Tile extends React.Component {
	render() {

		console.log("rendering a tile at " + this.props.rowIndex + this.props.tileIndex)
		
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
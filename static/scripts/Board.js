
class Board extends React.Component {

	render() {

		var boardArray = gamestate.tiles // comes right from flask kwargs
		var reactRowArray = []
		for(var i = 0; i < boardArray.length; i++){
			reactRowArray.push(this.generateRow(i, boardArray[i]))
		}
		return <div className="board">{reactRowArray}</div>
	}

	generateRow(rowIndex, row){

		var isDarkTile = rowIndex%2==0 ? false : true;

		var reactTileArray = []
		for(var tileIndex = 0; tileIndex < row.length; tileIndex++) {
			reactTileArray.push(this.generateTile(isDarkTile, rowIndex, tileIndex, row[tileIndex]))
			isDarkTile = !isDarkTile
		}

		return reactTileArray
	}

	generateTile(isDarkTile, rowIndex, tileIndex, tile){

		var tileDiv = (
		<div 
			key = {tileIndex.toString() + rowIndex.toString()}
			style = {{left: (tileIndex*60) + "px", top:(rowIndex*60)+"px"}} 
			className = {isDarkTile ? "tile darkTile" : "tile lightTile"}>

			{/* tile contents	 */}
			<span>{this.pieceInitials(tile)}</span>
		
		</div>
		);

		return tileDiv;
	}

	pieceInitials(tile){
		if (tile.piece == null) return;
		return tile.piece.color[0] + tile.piece.type[0]
	}

    
}
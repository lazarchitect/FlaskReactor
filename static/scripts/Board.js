
class Board extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			isLoaded: false,
			board: null,
			message: "Loading board..."
		}
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
			style={{left: (tileIndex*60) + "px", top:(rowIndex*60)+"px"}} 
			className={isDarkTile ? "tile darkTile" : "tile lightTile"}>
			<span>{this.pieceInitials(tile)}</span>
		</div>
		);

		return tileDiv;
	}

	pieceInitials(tile){
		if (tile.piece == null) return;
		return tile.piece.color[0] + tile.piece.type[0]
	}

    render() {
		if(this.state.isLoaded){

			var boardArray = JSON.parse(this.state.board).tiles
			var reactRowArray = []
			for(var i = 0; i < boardArray.length; i++){
				reactRowArray.push(this.generateRow(i, boardArray[i]))
			}

			return <div className="board">{reactRowArray}</div>
		}
		else {
			return <p>{this.state.message}</p>
		}
	}

	componentDidMount(){

		var board = this;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://localhost:5000/static/games/initialLayout.json")
		
		xhr.onreadystatechange = function(){
			if(xhr.readyState == XMLHttpRequest.DONE){
				if(xhr.status == 200){
					board.setState({
						isLoaded: true,
						board: xhr.response
					})
					console.log(xhr.response)
				}
				else {
					board.setState({
						message: "Board failed to load."
					})
				}
			}
		}
		xhr.send();  
    }
    
}
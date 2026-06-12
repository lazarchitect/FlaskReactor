
'use strict';

import React, {useState} from 'react';
import {generateHighlights} from "./ChessHighlighter";
import {chessSocketConnect, chessSocketUpdate} from "./ChessSocket";
import {pieceAt} from "./chessUtils";

let yourTurn = payload.yourTurn;

export function Chessboard() {

	const [boardstate, setBoardstate] = React.useState(payload.boardstate);

	// useEffect ensures the component has rendered at least once before the ws connection, which syncs with the chessboard, is made.
	// note - this only triggers on the first render, due to the empty dependency array. (no dependencies => no ongoing effect)
	React.useEffect(() => chessSocketConnect(setBoardstate), []);

	let [highlightedTiles, setHighlightedTiles] = useState([]);
	let [activeTile, setActiveTile] = React.useState([]);

	let boardOnClick = (mouseEvent) => {

		if(!yourTurn) return;

		const tileId = mouseEvent.target.id;

		const piece = pieceAt(boardstate, tileId);

		if(highlightedTiles.includes(tileId)){
			chessSocketUpdate(tileId, activeTile);
			setHighlightedTiles([]);
			setActiveTile([]);
		}
		else {
			if(piece === undefined || piece == null || piece.color !== payload.userColor) return;
			setHighlightedTiles(generateHighlights(boardstate, piece));
			setActiveTile(tileId);
		}

	};

	return (
		<div id="board" onClick={boardOnClick}>
			{boardstate.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val} highlightedTiles={highlightedTiles} />)}
		</div>
	);
}

function Row({rowIndex, tiles, highlightedTiles}){

    let isDarkTile = rowIndex % 2 !== 0;

    let reactTileArray = [];
	for(let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {

		let tileId = rowIndex.toString() + tileIndex.toString();
		let isHighlightedTile = highlightedTiles.includes(tileId);

		reactTileArray.push(
			<Tile key={tileIndex} isDarkTile={isDarkTile} isHighlightedTile={isHighlightedTile} tileId={tileId} data={tiles[tileIndex]}/>
		)
		isDarkTile = !isDarkTile;
	}

	return <div className="chessRow">{reactTileArray}</div>;
}

function Tile({isDarkTile, isHighlightedTile, tileId, data}) {

	const piece = data.piece;

	let imagePath = "";

	if (piece != null) {
		imagePath = "/frontend/images/" + piece.color + piece.type + ".png";

		if (piece.type === "Bishop" && piece.color === "Black") {
			imagePath = "/frontend/svg/" + piece.color + piece.type + ".svg";
		}
	}

	const color = isDarkTile ? "dark" : "light";
	const className = `tile ${color}${isHighlightedTile ? "HighlightedTile" : "Tile"}`;

	return (
		<span key={tileId} className={className} id={tileId}>
			{ imagePath !== "" && <img src={imagePath} className="pieceImg"/> }
		</span>
	);
}

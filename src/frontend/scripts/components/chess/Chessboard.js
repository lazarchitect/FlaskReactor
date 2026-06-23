
'use strict';

import React, {useState, useEffect} from 'react';
import generateMoves from "./moveGenerator";
import {chessSocketConnect, sendMoveUpdate} from "./chessSocket";
import {pieceAt} from "./chessUtils";

export function Chessboard() {

	const [boardstate, setBoardstate] = useState(payload.game.boardstate);
	const [gameDetails, setGameDetails] = useState( []); // gets populated during socket connect

	let [highlightedTiles, setHighlightedTiles] = useState([]);
	let [activeTile, setActiveTile] = useState("");

	// useEffect ensures the component has rendered at least once before the ws connection, which syncs with the chessboard, is made.
	// note - this only triggers on the first render, due to the empty dependency array. (no dependencies => no ongoing effect)
	useEffect(() => chessSocketConnect(setBoardstate, setGameDetails), []);


	let boardOnClick = (mouseEvent) => {

		if (gameDetails.activePlayer !== payload.username) return;

		const tileId = mouseEvent.target.id;

		const piece = pieceAt(boardstate, tileId);

		if(highlightedTiles.includes(tileId)) {
			sendMoveUpdate(tileId, activeTile);
			setHighlightedTiles([]);
			setActiveTile("");
		}
		else if (piece !== undefined && piece.color === payload.userColor) {
			setHighlightedTiles(generateMoves(boardstate, gameDetails, piece));
			setActiveTile(tileId);
		}
		else {
			setHighlightedTiles([]);
			setActiveTile("");
		}

	};

	return (
		<div id="chessboard" onClick={boardOnClick}>
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
	let altText = "";

	if (piece != null) {
		imagePath = "/frontend/images/" + piece.color + piece.type + ".png";
		altText = "A " + piece.color + " " + piece.type + ".";

		if (piece.type === "Bishop" && piece.color === "Black") {
			imagePath = "/frontend/svg/" + piece.color + piece.type + ".svg";
		}
	}

	const color = isDarkTile ? "dark" : "light";
	const className = `tile ${color}${isHighlightedTile ? "HighlightedTile" : "Tile"}`;

	return (
		<span key={tileId} className={className} id={tileId}>
			{ imagePath !== "" && <img src={imagePath} className="pieceImg" alt={altText} /> }
		</span>
	);
}

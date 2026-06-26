
'use strict';

import React, {useEffect, useState} from 'react';
import generateMoves from "./moveGenerator";
import {chessSocketConnect, sendMoveUpdate} from "./chessSocket";
import {isPromotion, pieceAt} from "./chessUtils";
import PromotionModal from "./PromotionModal";

export function Chessboard() {

	const [boardstate, setBoardstate] = useState(payload.game.boardstate);
	const [gameDetails, setGameDetails] = useState([]); // gets populated during socket connect

	const [highlightedTiles, setHighlightedTiles] = useState([]);
	const [activeTileId, setActiveTileId] = useState(""); // refers to tile where the piece that's selected for movement is located

	// useEffect ensures the component has rendered at least once before the ws connection, which syncs with the chessboard, is made.
	// note - this only triggers on the first render, due to the empty dependency array. (no dependencies => no ongoing effect)
	useEffect(() => chessSocketConnect(setBoardstate, setGameDetails), []);


	let boardOnClick = (mouseEvent) => {

		if (gameDetails.activePlayer !== payload.username) return;

		const clickedTileId = mouseEvent.target.id;

		const piece = pieceAt(boardstate, clickedTileId);

		if(highlightedTiles.includes(clickedTileId)) {

			if (isPromotion(piece, clickedTileId, activeTileId)) {
				return;
			}

			sendMoveUpdate(clickedTileId, activeTileId);
			setHighlightedTiles([]);
			setActiveTileId("");
		}
		else if (piece !== undefined && piece.color === payload.userColor) {
			setHighlightedTiles(generateMoves(boardstate, gameDetails, piece));
			setActiveTileId(clickedTileId);
		}
		else {
			setHighlightedTiles([]);
			setActiveTileId("");
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

	const color = isDarkTile ? "dark" : "light";
	const className = `tile ${color}${isHighlightedTile ? "HighlightedTile" : "Tile"}`;

	return (
		<span key={tileId} className={className} id={tileId}>
			{ data.piece != null && <Piece piece={data.piece} /> }
			{tileId === "70" && <PromotionModal tileId={tileId}/>}
		</span>
	);
}

export function Piece ({piece}) {

	let imagePath = "/frontend/images/" + piece.color + piece.type + ".png";
	let altText = "A " + piece.color + " " + piece.type + ".";

	if (piece.type === "Bishop" && piece.color === "Black") {
		imagePath = "/frontend/svg/" + piece.color + piece.type + ".svg";
	}
	 return <img src={imagePath} className="pieceImg" alt={altText} />;
}
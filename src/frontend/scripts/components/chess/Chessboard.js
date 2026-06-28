
'use strict';

import React, {createContext, useEffect, useState} from 'react';
import generateMoves from "./moveGenerator";
import {chessSocketConnect, sendMoveUpdate} from "./chessSocket";
import {isPromotion, pieceAt} from "./chessUtils";
import {Row} from "./ChessboardElements";
import PromotionModal from "./PromotionModal";

export const ActivePieceContext = createContext({});

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

'use strict';

import React, {createContext, useEffect, useState} from 'react';
import generateMoves from "./moveGenerator";
import {chessSocketConnect, sendMoveUpdate} from "./chessSocket";
import {isPromotion, pieceAt} from "./chessUtils";
import {Row} from "./chessboardElements";
import PromotionModal from "./PromotionModal";

export const ActivePieceContext = createContext({});

export function Chessboard() {

	const [boardstate, setBoardstate] = useState(payload.game.boardstate);
	const [gameDetails, setGameDetails] = useState([]); // gets populated during socket connect

	const [highlightedTiles, setHighlightedTiles] = useState([]);
	const [activePieceInfo, setActivePieceInfo] = useState({}); // concerning the piece that's selected for movement

	let [displayPromotionModal, setDisplayPromotionModal] = useState(false);
	let [promotionTileId, setPromotionTileId] = useState("");

	// useEffect ensures the component has rendered at least once before the ws connection, which syncs with the chessboard, is made.
	// note - this only triggers on the first render, due to the empty dependency array. (no dependencies => no ongoing effect)
	useEffect(() => chessSocketConnect(setBoardstate, setGameDetails), []);

	function removeTemporaryState() {
		setHighlightedTiles([]);
		setActivePieceInfo({});
		setDisplayPromotionModal(false);
		setPromotionTileId("");
	}

	let boardOnClick = (mouseEvent) => {

		if (gameDetails.activePlayer !== payload.username) return;

		const clickedId = mouseEvent.target.id;

		console.log(clickedId);

		if (clickedId.includes("promotion")) {
			if (clickedId === "promotionPieceDiv") {
				removeTemporaryState();
			}
			return; // promotion components have their own onClick behavior
		}
		const piece = pieceAt(boardstate, clickedId);

		if(highlightedTiles.includes(clickedId)) {

			if (isPromotion(activePieceInfo, clickedId)) {
				// display modal but do not send any server message or update any state just yet
				console.log("we got here");
				setDisplayPromotionModal(true);
				setPromotionTileId(clickedId);
				promotionTileId = clickedId;
				return;
			}

			sendMoveUpdate(activePieceInfo.tileId, clickedId);
			removeTemporaryState();
		}
		else if (piece !== undefined && piece.color === payload.userColor) {
			setHighlightedTiles(generateMoves(boardstate, gameDetails, piece));
			setActivePieceInfo({color: piece.color, type: piece.type, tileId: clickedId});
			setDisplayPromotionModal(false);
			setPromotionTileId("");
		}
		else {
			removeTemporaryState();
		}

	};

	return (
		<div id="chessboard" onClick={boardOnClick}>
			<ActivePieceContext.Provider value={activePieceInfo}>
				{boardstate.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val} highlightedTiles={highlightedTiles} />)}
				{ displayPromotionModal && <PromotionModal tileId={promotionTileId} /> }
			</ActivePieceContext.Provider>
		</div>
	);
}
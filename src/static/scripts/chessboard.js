
'use strict';

import React from 'react';

let highlightedTiles = [];
let active_coords = [];

const gameId = payload.game.id;
let yourTurn = payload.yourTurn;
let blackKingMoved = payload.game.blackkingmoved;
let whiteKingMoved = payload.game.whitekingmoved;
let wqr_moved = payload.game.wqr_moved;
let wkr_moved = payload.game.wkr_moved;
let bqr_moved = payload.game.bqr_moved;
let bkr_moved = payload.game.bkr_moved;

import * as chessUtils from './chessUtils';
import * as chessConsts from './chessConsts';

function chessSocketSubscribe(chessSocket){
	const subscribeObj = {
		"request": "subscribe",
		"gameId": gameId,
		"username": payload.username,
		"ws_token": payload.ws_token
	};
	const subscribeStr = JSON.stringify(subscribeObj);
	chessSocket.send(subscribeStr);
}

function chessSocketUpdate(chessSocket, tileId){
	const updateObj = {
		"request": "update",
		"ws_token": payload.ws_token,
		"gameId": payload.game.id,
		"player": payload.player,
		"userId": payload.userId,
		"src": active_coords[1] +""+ active_coords[0],
		"dest": tileId
	}
	const updateStr = JSON.stringify(updateObj);
	chessSocket.send(updateStr);
}

function chessSocketConnect(boardstate, setBoardstate) {
	const chessSocket = new WebSocket(payload.wsBaseUrl + "/chess");
	// this is where you might initiate a statSocket as well for db chess stats
	// EDIT: why would stats need a websocket? it doesn't need to update on the fly. HTTP would suffice methinks?

	chessSocket.onopen = (() => chessSocketSubscribe(chessSocket));

	chessSocket.onmessage = (messageEvent) => {

		const data = JSON.parse(messageEvent.data);

		if(data.command === "updateBoard"){
			setStatus(determineStatus(payload, data));
			setBoardstate(data.newBoardstate);
			blackKingMoved = data.blackKingMoved;
			whiteKingMoved = data.whiteKingMoved;
			bqr_moved = data.bqrMoved;
			bkr_moved = data.bkrMoved;
			wqr_moved = data.wqrMoved;
			wkr_moved = data.wkrMoved;

			yourTurn = payload.username === data.activePlayer;
			boardstate = data.newBoardstate;
		}
		else if(data.command === "info"){
			setStatus(determineStatus(payload, data));
		}
		else if(data.command === "endGame"){
			setStatus(determineStatus(payload, data))
		}
		else if(data.command === "error"){
			console.log(data.message)
			alert(data.message)
		}
	};

	const board = document.getElementById("board");

	board.onclick = function(mouseEvent){

		if(!yourTurn) return;

		const tileId = mouseEvent.target.id;
		const col = parseInt(tileId[0]);
		const row = parseInt(tileId[1]);

		if(isNaN(col) || isNaN(row)) {
			// invalid tileId
			return;
		}

		const coord = row +""+ col;
		const tile = boardstate[row][col]
		const piece = tile.piece;
		if(!highlightedTiles.includes(coord)){

			removeHighlights();

			if(piece === undefined || piece == null || piece.color !== payload.userColor) return;

			generateHighlights(boardstate, piece);

		}
		else {
			chessSocketUpdate(chessSocket, tileId);
			removeHighlights();
		}

	};
}

function removeHighlights(){
	active_coords = [];
	highlightedTiles.forEach(coords => {
		let tileDiv = document.getElementById(coords[1] + "" + coords[0]);
		tileDiv.classList.remove("darkHighlighted");
		tileDiv.classList.remove("lightHighlighted");
	});
	highlightedTiles = [];
}

// TODO for #78: modify this function to adhere to the logic of #78 regarding move legality under check.
// so we need to make moves only generate highlights if they help escape check status, or do not enter it in the first place.
// TODO optional: refactor this function to use helper functions from chessUtils.js
function generateHighlights(boardstate, piece){ // void

	highlightedTiles = [];
	active_coords = [piece.row, piece.col];

	const enemyColor = piece.color == "Black" ? "White" : "Black";

	const allyKingCoords = chessUtils.getKingCoords(boardstate, piece.color);

	if(piece.type === "Pawn"){
		const whiteDirection = -1;
		const blackDirection =  1;
		const pieceDirection = piece.color === "Black" ? blackDirection : whiteDirection;
		const finalRow = piece.color === "Black" ? 7 : 0;
        const starterRow = piece.color === "Black" ? 1 : 6;

		const row = piece.row;
		if(row === finalRow) return; // will never happen under promotion

		// advance 1
		if(boardstate[piece.row+pieceDirection][piece.col].piece === undefined) {

			let srcCoords = [piece.row, piece.col];
			let destCoords = [piece.row+pieceDirection, piece.col];
			let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

			// if currently in check, only add the highlight if the move escapes check.
			if (chessUtils.inCheck(boardstate, enemyColor, allyKingCoords)) {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col);		
				}
			}
			// if not currently in check, add any highlight EXCEPT those that introduce check.
			else {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col);
				}
			}
			
		}
		// advance 2
		if(row === starterRow
				&& boardstate[piece.row+pieceDirection][piece.col].piece === undefined
				&& boardstate[piece.row+(pieceDirection*2)][piece.col].piece === undefined) {

			let srcCoords = [piece.row, piece.col];
			let destCoords = [piece.row+(pieceDirection*2), piece.col];
			let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

			if (chessUtils.inCheck(boardstate, enemyColor, allyKingCoords)) {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row+(pieceDirection*2)) + ""  + piece.col);		
				}
			}
			else {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col);
				}
			}
				
			highlightedTiles.push((piece.row+pieceDirection*2) + "" + piece.col);

		
			}
		// attack left
		const leftTargetTile = boardstate[piece.row+pieceDirection][piece.col-1];
		if(leftTargetTile !== undefined && leftTargetTile.piece !== undefined && leftTargetTile.piece.color === enemyColor) {

			let srcCoords = [piece.row, piece.col];
			let destCoords = [piece.row + pieceDirection, piece.col - 1];
			let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

			if (chessUtils.inCheck(boardstate, enemyColor, allyKingCoords)) {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col - 1);		
				}
			}
			else {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col - 1);
				}
			}


		}
		// attack right
		const rightTargetTile = boardstate[piece.row+pieceDirection][piece.col+1];
		if(rightTargetTile !== undefined && rightTargetTile.piece !== undefined && rightTargetTile.piece.color === enemyColor) {

			let srcCoords = [piece.row, piece.col];
			let destCoords = [piece.row + pieceDirection, piece.col + 1];
			let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

			if (chessUtils.inCheck(boardstate, enemyColor, allyKingCoords)) {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col + 1);		
				}
			}
			else {
				if (!chessUtils.inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
					highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col + 1);
				}
			}

		}
	}

	// possible refactoring: piece and color enums instead of strings?
	else if(piece.type === "King"){
		if (piece.color === "White") {
			whiteCastlingMoves(boardstate);
		}
		else if (piece.color === "Black") {
			blackCastlingMoves(boardstate);
		}

		// TODO: kings cannot move into a check position
		chessConsts.ROYAL_OFFSETS.forEach(offset => {
			const destRow = piece.row+offset[0];
			const destCol = piece.col + offset[1];

			if(!outOfBounds(destRow, destCol)){
				const targetPiece = boardstate[destRow][destCol].piece;
				if(targetPiece === undefined || targetPiece.color === enemyColor) {

					// TODO much of this modifiedBoardstate check logic can be encapsulated and refactored into a callable function. 
					// just need to pass in a bunch of params but its still better IMO


                    // TODO BUG pieceDirection IS NOT DEFINED HERE?
					let srcCoords = [piece.row, piece.col];
					let destCoords = [piece.row + pieceDirection, piece.col + 1];
					let modifiedBoardstate = chessUtils.previewModifiedBoard(boardstate, srcCoords, destCoords);

					if (inCheck(boardstate, enemyColor, allyKingCoords)) {
						if (!inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
							highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col + 1);		
						}
					}
					else {
						if (!inCheck(modifiedBoardstate, enemyColor, allyKingCoords)) {
							highlightedTiles.push((piece.row + pieceDirection) + ""  + piece.col + 1);
						}
					}
					
					highlightedTiles.push(destRow + "" + destCol);
				}
			}
		});
	}

	else if(piece.type === "Knight"){
		chessConsts.KNIGHT_OFFSETS.forEach(offset => {
			const destRow = piece.row+offset[0];
			const destCol = piece.col + offset[1];
			if(!outOfBounds(destRow, destCol)){
				const targetPiece = boardstate[destRow][destCol].piece;
				if(targetPiece === undefined || targetPiece.color === enemyColor){
					highlightedTiles.push(destRow + "" + destCol);
				}
			}
		});
	}

	else if (piece.type === "Rook") {
		highlightedTiles = sliderMoves(piece, boardstate, chessConsts.ROOK_OFFSETS);
	}
	else if(piece.type === "Bishop") {
		highlightedTiles = sliderMoves(piece, boardstate, chessConsts.BISHOP_OFFSETS);
	}
	else if(piece.type === "Queen") {
		highlightedTiles = sliderMoves(piece, boardstate, chessConsts.ROYAL_OFFSETS);
	}


	for(let index in highlightedTiles){
		const coordinate = highlightedTiles[index];
		const tileDiv = document.getElementById(coordinate[1]+""+coordinate[0]);
		if(tileDiv.classList.contains("darkTile")){
			tileDiv.classList.add("darkHighlighted");
		}
		else {
			tileDiv.classList.add("lightHighlighted");
		}

	}

}

function outOfBounds(row, col){
	return row < 0 || row > 7 || col < 0 || col > 7;
}

function sliderMoves(piece, boardstate, offsets) {
	let moveList = [];

	offsets.forEach(offset => {
		const rowOffset = offset[0];
		const colOffset = offset[1];
		scan(rowOffset, colOffset, piece.row, piece.col, piece.color, boardstate, moveList);
	});
	return moveList;
}

// modify moveList and recurse to the next offset.
function scan(rowOffset, colOffset, row, col, color, boardstate, moveList){

	const targetRow = row+rowOffset;
	const targetCol = col+colOffset;

    // base case: line has exited the board
	if(outOfBounds(targetRow, targetCol)) return;

	// base case: there's a piece in the way.
	const targetPiece = boardstate[targetRow][targetCol].piece;
	if(targetPiece !== undefined){
		if(targetPiece.color !== color){
			moveList.push(targetRow + "" + targetCol);
		}
		return;
	}

	// empty tile? include and keep going.
	moveList.push(targetRow + "" + targetCol);
	scan(rowOffset, colOffset, row+rowOffset, col+colOffset, color, boardstate, moveList);

}

function determineStatus(payload, data){
	let status = "";
	if(data.gameEnded){
		status += "Game over."
		if(data.winner == null)
			status += "It's a tie."
		else if(data.winner === payload.username)
			status += "You win!"
		else if(payload.username === data.otherPlayer)
			status += "You lose...";
		else
			status += "Winner was " + data.winner;
		return status;
	}
	switch(payload.username){
		case data.activePlayer:
			status += "Your turn. ";
			if(playerInCheck(payload.userColor, data.whiteInCheck, data.blackInCheck)){
				status += "You are in check!"
			}
			break;
		case data.otherPlayer:
			status += "Waiting for opponent... ";
			if(playerInCheck(payload.enemyColor, data.whiteInCheck, data.blackInCheck)){
				status += "Opponent is in check!"
			}
			break;
		default:
			status += "spectating. ";
	}
	return status;
}

function setStatus(status){
	document.getElementById('status').innerHTML = status;
}

function playerInCheck(yourColor, whiteInCheck, blackInCheck){
	return (yourColor==="White" && whiteInCheck) || (yourColor==="Black" && blackInCheck);
}


function whiteCastlingMoves(boardstate) {
	// whiteKingCoords = "47"; // row 7, col 4
	if(!whiteKingMoved) {
		// TODO: add checks for !whiteKingSideRookMoved and !whiteQueenSideRookMoved	
		if (chessUtils.getPiece(boardstate, "57") === undefined && chessUtils.getPiece(boardstate, "67") === undefined) {
			if (!wqr_moved) {
				highlightedTiles.push("76"); // TODO refactor magic numbers
			}
		}
		if (chessUtils.getPiece(boardstate, "37") === undefined && chessUtils.getPiece(boardstate, "27") === undefined) {
			highlightedTiles.push("72");
		}
	}
}

function blackCastlingMoves(boardstate) {
	// blackKingCoords = "40"; // row 7, col 4
	if(!blackKingMoved) {
		// TODO: add checks for !blackKingSideRookMoved and !blackQueenSideRookMoved
		if (chessUtils.getPiece(boardstate, "50") === undefined && chessUtils.getPiece(boardstate, "60") === undefined) {
			highlightedTiles.push("06");
		}
		if (chessUtils.getPiece(boardstate, "30") === undefined && chessUtils.getPiece(boardstate, "20") === undefined) {
			highlightedTiles.push("02");
		}
	}
}

export function Chessboard() {

	const [boardstate, setBoardstate] = React.useState(payload.boardstate);

	// need useEffect (which triggers after rendering) to ensure the chessboard component
	// has rendered at least once before the ws connection, which syncs with the chessboard, is made.
	// note - this only triggers on the first render, due to the empty dependency array. (no dependencies => no ongoing effect)
	React.useEffect(() => chessSocketConnect(boardstate, setBoardstate), []);

	return (
		<div id="board">
			{boardstate.map((val, i)=><Row key={i.toString()} rowIndex={i} tiles={val}/>)}
		</div>
	);
}

function Row(props){

    let darkTile = props.rowIndex % 2 !== 0;

    let reactTileArray = []
	for(let tileIndex = 0; tileIndex < props.tiles.length; tileIndex++) {
		reactTileArray.push(
			<Tile key={tileIndex} darkTile={darkTile} rowIndex={props.rowIndex} tileIndex={tileIndex} data={props.tiles[tileIndex]}/>
		)
		darkTile = !darkTile
	}

	return <div className="chessRow">{reactTileArray}</div>;
}

function Tile(props) {

	const piece = props.data.piece;

	// TODO remove debug
	console.debug(piece);

	let imagePath = "";

	if (piece != null) {
		imagePath = "/static/images/" + piece.color + piece.type + ".png";

		if (piece.type === "Bishop" && piece.color === "Black") {
			imagePath = "/static/svg/" + piece.color + piece.type + ".svg";
		}
	}

	return (
		<span
			key = {props.tileIndex.toString() + props.rowIndex.toString()}
			className = {props.darkTile ? "tile darkTile" : "tile lightTile"}
			id = {props.tileIndex.toString() + props.rowIndex.toString()}
		>
			{/* tile contents */}
			{ imagePath !== "" &&
                <img src={imagePath} className="pieceImg"/>
			}
		</span>
	);
}

import {webSocketConnect} from "../common/SocketConnection";
import {playerInCheck} from "./chessUtils";

let socket = null;

export function chessSocketUpdate(tileId, activeTile) {
    const updateObj = {
        "request": "update",
        "ws_token": payload.ws_token,
        "gameId": payload.game.id,
        "player": payload.player,
        "userId": payload.userId,
        "src": activeTile,
        "dest": tileId
    }
    const updateStr = JSON.stringify(updateObj);
    socket.send(updateStr);
}

export function chessSocketConnect(setBoardstate) {

    socket = webSocketConnect({
        path: "/chess",
        onMessage: (messageEvent) => {

            const data = JSON.parse(messageEvent.data);

            if(data.command === "updateBoard"){
                setStatus(determineStatus(payload, data));
                setBoardstate(data.newBoardstate);
                // blackKingMoved = data.blackKingMoved;
                // whiteKingMoved = data.whiteKingMoved;
                // bqr_moved = data.bqrMoved;
                // bkr_moved = data.bkrMoved;
                // wqr_moved = data.wqrMoved;
                // wkr_moved = data.wkrMoved;

                // yourTurn = payload.username === data.activePlayer;
                // boardstate = data.newBoardstate;
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
        }
    });
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


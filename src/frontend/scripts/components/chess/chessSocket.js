import {webSocketConnect} from "../common/SocketConnection";
import {BLACK, WHITE} from "./chessConsts";

let socket = null;

export function sendResignation() {
    socket.sendUpdate({
        "request": "resign", // overwrites the update request field
        "player": payload.username
    });
}

export function sendMoveUpdate(src, dest) {
    socket.sendUpdate({"src": src, "dest": dest});
}

export function sendPromotionMoveUpdate(src, dest, typeChoice) {
    socket.sendUpdate({
        "promotion": true,
        "typeChoice": typeChoice,
        "src": src,
        "dest": dest
    });
}

export function chessSocketConnect(setBoardstate, setGameDetails) {

    socket = webSocketConnect({
        path: "/chess",
        onMessage: (messageEvent) => {

            const data = JSON.parse(messageEvent.data);

            if (data.command === "updateBoard"){
                setStatus(determineStatus(data));
                setBoardstate(data.newBoardstate);
                setGameDetails(data.gameDetails);
            }
            else if (data.command === "initialize") {
                setGameDetails(data.gameDetails);
                setStatus(determineStatus(data));
            }
            else if (data.command === "endGame"){
                setBoardstate(data.newBoardstate);
                setStatus(determineStatus(data))
            }
            else if (data.command === "info"){
                console.log(data);
            }
            else if (data.command === "error"){
                alert(data.message)
            }
        }
    });
}

function playerInCheck(color, whiteInCheck, blackInCheck) {
    return (color === WHITE && whiteInCheck) || (color === BLACK && blackInCheck);
}

function determineStatus(data){
    let status = "";
    if(data.gameEnded){
        status += "Game ended"
        if(data.mate === "Stalemate")
            status += " in stalemate."
        else {
            const loser = (payload.game.white_player === data.winner ? payload.game.black_player : payload.game.white_player);
            if(data.winner === payload.username) status += " with a checkmate. You win!"
            else if (loser === payload.username) status += " with a checkmate. You lose...";
            else status += ". Winner was " + data.winner; // spectator view
        }
        return status;
    }
    switch(payload.username){
        case data.gameDetails.activePlayer:
            status += "Your turn. ";
            if(playerInCheck(payload.userColor, data.whiteInCheck, data.blackInCheck)){
                status += "You are in check!"
            }
            break;
        case data.gameDetails.otherPlayer:
            status += "Waiting for opponent... ";
            const enemyColor = (payload.userColor === WHITE ? BLACK : WHITE);
            if(playerInCheck(enemyColor, data.whiteInCheck, data.blackInCheck)){
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


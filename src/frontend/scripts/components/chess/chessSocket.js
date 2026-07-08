import {webSocketConnect} from "../common/SocketConnection";

let socket = null;

export function sendMoveUpdate(src, dest) {
    const updateObj = {
        "player": payload.player,
        "userId": payload.userId,
        "src": src,
        "dest": dest
    }
    socket.sendUpdate(updateObj);
}

export function sendPromotionMoveUpdate(src, dest, typeChoice) {
    const updateObj = {
        "promotion": true,
        "typeChoice": typeChoice,
        "player": payload.player,
        "userId": payload.userId,
        "src": src,
        "dest": dest
    }
    socket.sendUpdate(updateObj);
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

function playerInCheck(yourColor, whiteInCheck, blackInCheck) {
    return (yourColor === "White" && whiteInCheck) || (yourColor === "Black" && blackInCheck);
}

function determineStatus(data){
    let status = "";
    if(data.gameEnded){
        status += "Game ended"
        if(data.mate === "Stalemate")
            status += " in stalemate."
        else if(data.winner === payload.username)
            status += " with a checkmate. You win!"
        else if(data.loser === payload.username)
            status += " with a checkmate. You lose...";
        else
            status += ". Winner was " + data.winner; // spectator view
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


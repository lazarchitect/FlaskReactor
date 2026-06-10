import {webSocketConnect} from "../common/SocketConnection";

let socket = null;

let yourTurn = payload.yourTurn;

export function isYourTurn() {
    return yourTurn;
}

export function quadSocketUpdate(sourceCoords, targetCoords){
    const message = {
        "username": payload.username,
        "src": sourceCoords,
        "dest": targetCoords
    }
    socket.update(message);
}

export function quadSocketConnect(setBoardstate, setLegendState) {

    socket = webSocketConnect("/quad");

    socket.onmessage = (messageEvent) => {

        const data = JSON.parse(messageEvent.data);

        if(data.command === "updateBoard"){ // TODO should be like "updateGame" or something wider
            setStatus(determineStatus(payload, data));
            setBoardstate(data.newBoardstate);
            setLegendState(data.newLegendState);
            yourTurn = payload.username === data.active_player;
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
}

function determineStatus(payload, data){
    let status = "";
    if(data.gameEnded) {
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
    switch(payload.username) {
        case data.active_player:
            status += "Your turn. ";
            break;
        case data.inactive_player:
            status += "Waiting for opponent... ";
            break;
        default:
            status += "spectating. ";
    }
    return status;
}

function setStatus(status){
    document.getElementById('status').innerHTML = status;
}

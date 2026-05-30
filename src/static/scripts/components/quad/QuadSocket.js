
const gameId = payload.game.id;

let socket = null;

export function quadSocketSubscribe(){
    const subscribeObj = {
        "request": "subscribe",
        "gameId": gameId,
        "username": payload.username,
        "ws_token": payload.ws_token
    };
    const subscribeStr = JSON.stringify(subscribeObj);
    socket.send(subscribeStr);
}

export function quadSocketUpdate(sourceCoords, targetCoords){
    const updateObj = {
        "request": "update",
        "ws_token": payload.ws_token,
        "gameId": payload.game.id,
        "player": payload.player,
        "userId": payload.userId,
        "src": sourceCoords,
        "dest": targetCoords
    }
    const updateStr = JSON.stringify(updateObj);
    socket.send(updateStr);
}

export function quadSocketConnect(setBoardstate) {

    socket = new WebSocket(payload.wsBaseUrl + "/quad");

    socket.onopen = (() => quadSocketSubscribe());

    socket.onmessage = (messageEvent) => {

        const data = JSON.parse(messageEvent.data);

        if(data.command === "updateBoard"){
            setStatus(determineStatus(payload, data));
            setBoardstate(data.newBoardstate);
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

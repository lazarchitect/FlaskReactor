
const gameId = payload.game.id;

let socket = null;
let retryTimer = 1000;

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

export function quadSocketConnect(setBoardstate, setLegendState) {

    socket = new WebSocket(payload.wsBaseUrl + "/quad");

    socket.onopen = () => {
        quadSocketSubscribe();
        retryTimer = 1000;
    }

    socket.onclose = () => {
        // TODO need some way to communicate temporary outage to user
        console.log("quadSocket closed. reopening...");
        setTimeout(() => quadSocketConnect(setBoardstate), retryTimer);
        retryTimer += Math.floor(Math.random()*1000);
        console.log(retryTimer);
    };

    socket.onmessage = (messageEvent) => {

        const data = JSON.parse(messageEvent.data);

        if(data.command === "updateBoard"){
            setStatus(determineStatus(payload, data));
            setBoardstate(data.newBoardstate);
            setLegendState(data.newLegendState);
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
            break;
        case data.otherPlayer:
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


const gameId = payload.game.id;

// TODO can these three functions be members of a QuadSocketConnection class which has the socket reference field?

function quadSocketSubscribe(quadSocket){
    const subscribeObj = {
        "request": "subscribe",
        "gameId": gameId,
        "username": payload.username,
        "ws_token": payload.ws_token
    };
    const subscribeStr = JSON.stringify(subscribeObj);
    quadSocket.send(subscribeStr);
}

// TODO DropLogic will need to be passed this function so it can send data to server upon drop
function quadSocketUpdate(quadSocket, tileId){
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
    quadSocket.send(updateStr);
}

export function quadSocketConnect(boardstate, setBoardstate) {
    const quadSocket = new WebSocket(payload.wsBaseUrl + "/quad");
    // this is where you might initiate a statSocket as well for db quad stats
    // EDIT: why would stats need a websocket? it doesn't need to update on the fly. HTTP would suffice methinks?

    quadSocket.onopen = (() => quadSocketSubscribe(quadSocket));

    quadSocket.onmessage = (messageEvent) => {

        const data = JSON.parse(messageEvent.data);

        if(data.command === "updateBoard"){
            setStatus(determineStatus(payload, data));
            setBoardstate(data.newBoardstate);
            // and set any other aspects front end game management needs

            // do we need this?
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

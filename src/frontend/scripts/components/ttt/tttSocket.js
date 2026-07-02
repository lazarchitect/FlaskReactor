import {webSocketConnect} from "../common/SocketConnection";

const gameId = payload.game.id;

let socket = null;

export function sendUpdate(boardIndex) {
    const updateObj = {
        "request": "update",
        "ws_token": payload.ws_token,
        "gameId": gameId,
        "gameType": "ttt",
        "player": payload.username,
        "boardIndex": boardIndex,
        "userId": payload.userId
    };
    const updateStr = JSON.stringify(updateObj);
    socket.send(updateStr);
}

export function tttSocketConnect(setBoardstate, setYourTurn) {

    const statSocket = new WebSocket(payload.wsBaseUrl + "/stat")

    socket = webSocketConnect({
        path: "/ttt",
        onMessage: (message) => {
            const data = JSON.parse(message.data);
            if (data.command === "updateBoard") {

                setStatus(determineStatus(payload, data))
                setBoardstate(data.newBoardstate);
                setYourTurn(payload.username === data.activePlayer);

            } else if (data.command === "endGame") {
                setStatus(determineStatus(payload, data));
                setYourTurn(payload.username === data.activePlayer);
                // call out to server - update this user's stats
                const messageObj = {
                    "request": "updateStat",
                    "ws_token": payload.ws_token,
                    "gameType": "ttt",
                    "gameId": gameId,
                    "userId": payload.userId,
                    "username": payload.username
                };
                const message = JSON.stringify(messageObj);
                statSocket.send(message); // TODO wouldn't this send incrementing stat updates for EVERYONE currently connected?? socketHandler should check who the user is?
            } else if (data.command === "info") {
                setStatus(determineStatus(payload, data));
            } else if (data.command === "error") {
                alert(data.contents);
            }
        }
    });
}

function setStatus(status) {
    document.getElementById('status').innerHTML = status;
}

/* Returns the updated status string,
   which gets displayed to the user at all times. */
function determineStatus(payload, data) {

    let retval = "";
    if (data.gameEnded) {
        retval += "Game over. ";
        if (data.winner == null) {
            retval += "It's a tie.";
        } else {
            if (payload.username === data.winner)
                retval += "You win!";

            else if (payload.username === data.otherPlayer)
                retval += "You lose...";

            else
                retval += "Winner was " + data.winner;
        }
    } else {
        switch (payload.username) {
            case data.activePlayer:
                retval += "Your turn.";
                break;
            case data.otherPlayer:
                retval += "Waiting for opponent...";
                break;
            default:
                retval += "spectating";
        }
    }
    return retval;
}
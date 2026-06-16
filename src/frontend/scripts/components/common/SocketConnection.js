
let socket = null;
let retryTimer = 1000;

/** Underlying socket behavior governing all client-server connections. Establishes socket open and close behavior, and handles repeated data passing, for all socket types.
 * @returns a socket with some preset connection details and logic, so that the consumer layer can focus solely on application logic. */
export function webSocketConnect({path, onMessage}) {

    socket = new WebSocket(payload.wsBaseUrl + path);

    socket.onopen = () => {
        socket.send(JSON.stringify({
            "request": "subscribe",
            "gameId": payload.game.id,
            "game_type": payload.game_type,
            "username": payload.username,
            "ws_token": payload.ws_token
        }));
        retryTimer = 1000;
    }

    socket.onmessage = onMessage;

    socket.onclose = () => {
        // attempt increasingly delayed looping reconnect ( + random jitter) when connection is lost.
        // TODO need some way to communicate temporary outage to user. Can display a "network reconnecting..." modal while state is not CONNECTED
        setTimeout(() => webSocketConnect({path, onMessage}), retryTimer);
        retryTimer += Math.floor(Math.random()*1000);
        console.log("socket connection to " + path + " closed. reopening in " + retryTimer + "ms");
    };

    socket.sendUpdate = (message) => {
        const updateObj = {
            request: "update",
            ws_token: payload.ws_token,
            gameId: payload.game.id,
            ...message
        };
        socket.send(JSON.stringify(updateObj));
    }

    return socket;

}
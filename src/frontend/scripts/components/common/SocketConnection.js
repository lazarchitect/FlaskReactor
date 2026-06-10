
let socket = null;
let retryTimer = 1000;

/** Underlying socket behavior governing all client-server connections. Establishes socket open and close behavior, and handles repeated data passing, for all socket types.
 * @returns a socket with some preset connection details and logic, so that the consumer layer can focus solely on application logic. */
export function webSocketConnect(socketPath) {

    socket = new WebSocket(payload.wsBaseUrl + socketPath);

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

    socket.onclose = () => {
        // attempt exponential delayed ( + jitter) looping reconnect when connection is lost.
        // TODO need some way to communicate temporary outage to user. Can display a "network reconnecting..." modal while state is not CONNECTED
        console.log("socket connection to " + socketPath + " closed. reopening...");
        setTimeout(() => webSocketConnect(socketPath), retryTimer);
        retryTimer += Math.floor(Math.random()*1000);
        console.log(retryTimer);
    };

    socket.update = (message) => {
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
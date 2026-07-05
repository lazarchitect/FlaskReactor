
/** game webpages have multiple socket connections which need to be tracked independently while page is open */
const sockets = {}; // k: path, v: WebSocket object
const retryTimers = {}; // k: path, v: integer retry delay

/** Underlying socket behavior governing all client-server connections.
 * Establishes socket open and close behavior, and handles repeated data passing, for all socket types.
 * Immediately connects to socket path by sending a subscribe message with payload details, including game ID.
 * @returns a socket with some preset connection details and logic, so that the consumer layer can focus solely on application logic. */
export function webSocketConnect({path, onMessage}) {

    const socket = new WebSocket(payload.wsBaseUrl + path);
    sockets[path] = socket;
    retryTimers[path] ??= 1000; // only sets to 1000 the first time, not on reconnect

    socket.onopen = () => {
        console.log(`socket connection to ${path} established!`);
        socket.send(JSON.stringify({
            "request": "subscribe",
            "gameId": payload.game.id,
            "game_type": payload.game_type,
            "username": payload.username,
            "ws_token": payload.ws_token
        }));
        retryTimers[path] = 1000;
    }

    socket.onmessage = onMessage;

    socket.onclose = () => {
        // attempt increasingly delayed looping reconnect ( + random jitter) when connection is lost.
        setTimeout(() => webSocketConnect({path, onMessage}), retryTimers[path]);
        retryTimers[path] += Math.floor(Math.random()*1000);
        console.log("socket connection to " + path + " closed. reopening in " + retryTimers[path] + "ms");
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
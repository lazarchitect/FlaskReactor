import {webSocketConnect} from "./SocketConnection";

let socket = null;

// initial value (chats so far) populated during ws subscription process
let chatLogGlobal = [];

export function chatSocketConnect(setChatLog) {

    // TODO return immediately if user is not one of the players

    socket = webSocketConnect({
        path: '/chat',
        onMessage: (messageEvent) => {

            let data = JSON.parse(messageEvent.data);

            if (data.command === "initialize") {
                chatLogGlobal = data.chats;
                setChatLog(buildFormattedChatLog(chatLogGlobal));
            } else if (data.command === "append") {
                chatLogGlobal.push(data.chat);
                setChatLog(buildFormattedChatLog(chatLogGlobal));
            } else if (data.command === "error") {
                alert(data.message);
            }
        }
    })
}

export function sendChatUpdate({username, content}) {
    socket.sendUpdate({username, content});
}

/** returns a single concatenated string containing full formatted chat log */
function buildFormattedChatLog(chatLog) {

    let retval = "";

    chatLog.forEach(chat => {
        retval += chat['username'] + ": " + chat['content'] + "\n";
    });

    return retval;

}
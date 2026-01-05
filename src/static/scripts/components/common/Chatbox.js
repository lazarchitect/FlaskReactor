
'use strict';

import React, {useEffect, useRef, useState} from 'react';

// global socket object, used in many functions here and created during a return-less useEffect block.
// instantiated during ChatBox mount. 
let chatSocket = null;

// initial value (chats so far) populated during ws subscription process
let chatLogGlobal = [];

export function Chatbox ( {expanded} ) {

    // TODO possible enhancement - ignore rendering for users who opt out. User settings is in v0.7.0
    // if (!payload.preferences.chat) return;

    const [currentlyExpanded, setCurrentlyExpanded] = useState(expanded);
    
    const [chatLog, setChatLog] = useState("null");
    React.useEffect(() => chatSocketConnect(setChatLog), []); // initializes chat connection, pulls chats


    return (
        <div id="chatbox">
            {currentlyExpanded && 
                <div id="chatbox-text-area">
                    <ChatBoxLog log={chatLog} />
                    <ChatBoxInput />		
                </div>
            }
            <div id="chatbox-base">
                <span id='chatbox-label'>Chat</span>
                <span id='chatbox-indicator'
                    onClick={() => {
                        setCurrentlyExpanded(!currentlyExpanded); // toggle
                        let nowExpanded = !currentlyExpanded;
                        document.getElementById('chatbox-indicator').innerText = nowExpanded ? 'Hide' : 'Expand';
                    }}>
                
                    Expand
                
                </span>
            </div>

        </div>
    );
}


function chatSocketConnect(setChatLog) {

    // TODO return immediately if user is not one of the players

    chatSocket = new WebSocket(payload.wsBaseUrl + "/chat");

    chatSocket.onopen = (() => chatSocketSubscribe());

    chatSocket.onmessage = (messageEvent) => {

        let data = JSON.parse(messageEvent.data);

        if (data.command === "initialize") {
            chatLogGlobal = data.chats;
            setChatLog(buildFormattedChatLog(chatLogGlobal));
        }

        else if (data.command === "append") {
            chatLogGlobal.push(data.chat);
            setChatLog(buildFormattedChatLog(chatLogGlobal));
        }
        else if (data.command === "error") {
            alert(data.message);
        }
        else if (data.command === "info") {
            // console.log(data.content);
        }
    }

}


function chatSocketSubscribe () {

    chatSocket.send(
        JSON.stringify({
            "request": "subscribe",
            "gameId": payload.game.id,
            "game_type": payload.game_type,
            "username": payload.username,
            "ws_token": payload.ws_token
        })
    );
}

/** returns a single concatenated string containing full formatted chat log */
function buildFormattedChatLog(chatLog) {

    let retval = "";

    chatLog.forEach(chat => {
        retval += chat['username'] + ": " + chat['content'] + "\n";
    });

    return retval;

}

/** Read-only text box that displays history of chats between players, since the game started.
 * 'log' prop is a formatted string containing all the chat data. */
function ChatBoxLog({log}) {

    let scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [log]); // scrolls latest into view when log updates

    return <textarea ref={scrollRef} id="chatbox-log" readOnly value={log} />;
}

/** box where user types chat messages. <Enter> will trigger a socket send. */
function ChatBoxInput() {

    const enterListener = (event) => {
        if (event.key === "Enter") {

            event.preventDefault();

            let inputField = document.getElementById('chatbox-input');

            let trimmedInput = inputField.value.trim();

            if (trimmedInput.length !== 0) {
                chatSocket.send(JSON.stringify({
                    "request": "update",
                    "ws_token": payload.ws_token,
                    "gameId": payload.game.id,
                    "username": payload.username,
                    "content": trimmedInput,
                }));

                inputField.value = '';
            }
        }
    };

    return <textarea id="chatbox-input" onKeyDown={enterListener} form="chatbox-form" rows="2" />;
}



'use strict';

import React, {useEffect, useRef, useState} from 'react';
import {chatSocketConnect, sendChatUpdate} from "./chatSocket";

// possible enhancement - keep the chatbox expanded if user expanded it previously
export function Chatbox ( {expanded} ) {

    const [isCurrentlyExpanded, setIsCurrentlyExpanded] = useState(expanded);
    
    const [chatLog, setChatLog] = useState("null");
    React.useEffect(() => chatSocketConnect(setChatLog), []); // initializes chat connection, pulls chats


    return (
        <div id="chatbox">
            {isCurrentlyExpanded &&
                <div id="chatbox-text-area">
                    <ChatBoxLog log={chatLog} />
                    <ChatBoxInput />
                </div>
            }
            <div id="chatbox-base">
                <span id='chatbox-label'>Chat</span>
                {/* TODO: indicator needs some type of notification if it's unexpanded while a message arrives */}
                <span id='chatbox-indicator'
                    onClick={() => {
                        let isNowExpanded = !isCurrentlyExpanded;
                        setIsCurrentlyExpanded(!isCurrentlyExpanded); // toggle
                        document.getElementById('chatbox-indicator').innerText = isNowExpanded ? 'Hide' : 'Expand';
                    }}>
                
                    Expand
                
                </span>
            </div>

        </div>
    );
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

/** editable text box where user types chat messages. <Enter> will trigger a socket send. */
function ChatBoxInput() {

    const enterListener = (event) => {
        if (event.key === "Enter") {

            event.preventDefault();

            let inputField = document.getElementById('chatbox-input');

            let trimmedInput = inputField.value.trim();

            if (trimmedInput.length !== 0) {
                sendChatUpdate({username: payload.username, content: trimmedInput});

                inputField.value = '';
            }
        }
    };

    return <textarea id="chatbox-input" onKeyDown={enterListener} form="chatbox-form" rows="2" />;
}


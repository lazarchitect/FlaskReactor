
'use strict';

import React, {useEffect, useRef, useState} from 'react';
import {chatSocketConnect, sendChatUpdate} from "./chatSocket";

// possible enhancement - keep the chatbox expanded if user expanded it previously
export function Chatbox ( {expanded} ) {

    const [chatLog, setChatLog] = useState("loading chats...");
    const [isCurrentlyExpanded, setIsCurrentlyExpanded] = useState(expanded);
    const [notifCount, setNotifCount] = useState(0);
    const [indicatorText, setIndicatorText] = useState("Expand");
    const isExpandedRef = useRef(isCurrentlyExpanded);

    let incrementNotifCount = () => {
        console.log(isExpandedRef.current);
        if (!isExpandedRef.current) {
            setNotifCount((prevCount) => prevCount + 1);
        }
    }

    let onExpanderClick = () => {
        let isNowExpanded = !isCurrentlyExpanded; // toggle
        isExpandedRef.current = isNowExpanded;
        setIsCurrentlyExpanded(() => isNowExpanded);
        setIndicatorText(isNowExpanded ? "Hide" : "Expand");
        if (isNowExpanded) setNotifCount(0);
    }
    
    React.useEffect(() => chatSocketConnect(setChatLog, incrementNotifCount), []); // initializes chat connection, pulls chats

    return (
        <div id="chatbox">
            {isCurrentlyExpanded &&
                <div id="chatbox-text-area">
                    <ChatBoxLog log={chatLog} />
                    <ChatBoxInput />
                </div>
            }
            <div id="chatbox-base">
                <span id="chatbox-label">Chat</span>
                <span id="chatbox-indicator" onClick={onExpanderClick}>
                    {notifCount === 0 ? indicatorText : <NotifText indicatorText={indicatorText} notifCount={notifCount}/> }
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

function NotifText ({indicatorText, notifCount}) {
    return <>
        <span>{indicatorText}</span>
        <span style={{color: "red"}}>{` (${notifCount})`}</span>
</>;
}

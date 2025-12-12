'use strict';

import React, {useState} from 'react';

// inert unless created during ChatBox mount 
let chatSocket = null;

// populated during ws subscription process
let chatLogGlobal = [];

export function SiteHeader (props) {
	return (
		<div id="siteHeader">
			<span id="headerLeft">
				<a href="/">FlaskReactor</a> (Version {props.version})
			</span>
			<span id="headerRight">

				<span id="headerUsername">
					{props.username === null ? <a href="/">Log in / Sign up</a> : props.username}
				</span>

				{props.username != null ? 
					<form id="logout" action="/logout" method="POST">
						<input type="submit" value="Log Out"/>
					</form>
				: null }

			</span>
		</div>
	);
}

function wsSubscribe () {

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

// TODO rename to "wsChatConnect" or something to specify which socket type this is
function wsConnect(setChatLog) {

	// TODO return immediately if user is not one of the players

	// TODO AS WELL rename _ALL_ references to "Message" to "Chat", since socket 'messages' are keyword defined
	chatSocket = new WebSocket(payload.wsBaseUrl + "/message");

	chatSocket.onopen = (() => 
		wsSubscribe()
	);

	chatSocket.onmessage = (messageEvent) => {
		
        let data = JSON.parse(messageEvent.data);

		if (data.command === "initialize") {
			chatLogGlobal = data.chats;
            setChatLog(buildFormattedChatLog(chatLogGlobal));
            console.log("chat log initial value set.");
		}

		else if (data.command === "append") {
			chatLogGlobal.push(data.chat);
            setChatLog(buildFormattedChatLog(chatLogGlobal));
		}
		else if (data.command === "error") {
			alert(data.message);
		}
		else if (data.command === "info") {
			console.log(data.contents);
		}
	}

}

/** returns a single concatenated string containing full formatted chat log */
function buildFormattedChatLog(chatLog) {

	let retval = "";

	chatLog.forEach(chat => {
		retval += chat[1] + ": " + chat[2] + "\n";
	});

	return retval;

}

/** Read-only text box that displays history of chats between players, since the game started.
 * 'log' prop is a formatted string containing all the chat data. */
function MessageBoxLog({log}) {
	return <textarea id="messagebox-log" readOnly value={log} />;
}

/** box where user types chat messages. <Enter> will trigger a socket send. */
function MessageBoxInput() {

	const enterListener = (event) => {
		if (event.key === "Enter") {

			event.preventDefault();

			let inputField = document.getElementById('messagebox-input');

            console.log("InputField: " + inputField);

			let trimmedInput = inputField.value.trim();

			if (trimmedInput.length !== 0) {
				chatSocket.send(JSON.stringify({
					"request": "update",
					"ws_token": payload.ws_token,
					"gameId": payload.game.id,
					"username": payload.username,
					"message": trimmedInput,
				}));

				inputField.value = '';
			}
		}
	};

	return <textarea id="messagebox-input" onKeyDown={enterListener} form="messagebox-form" rows="2" />;
}

// TODO possible enhancement - ignore rendering for users who opt out. User settings is down the line
export function MessageBox ( {expanded} ) {

	const [currentlyExpanded, setCurrentlyExpanded] = useState(expanded);
    
    const [chatLog, setChatLog] = useState("null");
    React.useEffect(() => wsConnect(setChatLog), []); // initializes chat connection, pulls chats


	return (
		<div id="messagebox">
			{currentlyExpanded && 
				<div id="messagebox-chat-area">
					<MessageBoxLog log={chatLog} />
					<MessageBoxInput />		
				</div>
			}
			<div id="messagebox-base">
				<span id='messagebox-label'>Chat</span>
				<span id='messagebox-indicator'
					onClick={() => {
						setCurrentlyExpanded(!currentlyExpanded); // toggle
						let nowExpanded = !currentlyExpanded;
						let newText = nowExpanded ? 'Hide' : 'Expand';
						document.getElementById('messagebox-indicator').innerText = newText;
					}}>
				
					Expand
				
				</span>
			</div>

		</div>
	);
}
'use strict';

import React from 'react';

let chatLogGlobal = [];

export function SiteHeader (props) {
	return (
		<div id="siteHeader">
			<span id="headerLeft">
				Welcome to FlaskReactor! (Version {props.version})
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
};

function wsSubscribe (messageSocket) {

	messageSocket.send(
		JSON.stringify({
			"request": "subscribe",
			"gameId": payload.game.id,
			"username": payload.username
		})
	);
}

function wsConnect(chatLog, setChatLog) {

	const messageSocket = new WebSocket(payload.wsBaseUrl + "/message");

	messageSocket.onopen = (() => 
		// TODO possible improvement - limit chat connection to only players (not spectators)
		// by passing in username through props and checking
		wsSubscribe(messageSocket)
	);

	messageSocket.onmessage = (messageEvent) => {
		
		let data = JSON.parse(messageEvent.data);

		if (data.command == "initialize") {
			// setChatLog(data.chats); // dont care
			chatLogGlobal = data.chats;
			updateChatLog();
			console.log("chat log initial value set.");
		}

		else if (data.command == "append") {
			chatLogGlobal.push(data.chat);
			updateChatLog();
		}
	}

	let inputField = document.getElementById('messagebox-input');

	inputField.addEventListener("keydown", (event) => {
		if (event.key == "Enter") {

			event.preventDefault();
	
			let trimmedInput = inputField.value.trim();

			if (trimmedInput.length != 0) {
				messageSocket.send(JSON.stringify({
					"request": "update",
					"gameId": payload.game.id,
					"username": payload.username,
					"message": trimmedInput
				}));

				inputField.value = '';
			}
		}
	});
	
}

function updateChatLog() {
	document.getElementById('messagebox-log').value = outputCleanChatLog(chatLogGlobal);
}

function outputCleanChatLog(chatLog) {

	let retval = "";

	console.log("trying to update chat log as:" + chatLog.toString());

	chatLog.forEach(chat => {
		retval += chat[1] + ":" + chat[2] + "\n";
	});

	return retval;

}

function MessageBoxLog(props) {
	
	let [chatLog, setChatLog] = React.useState([]); // initial value can be blank, logs received later during subscribe

	React.useEffect(() => wsConnect(chatLog, setChatLog), []);

	return (
		<textarea id="messagebox-log" readOnly 
			value={
				// chatLog will be null on render, and thats ok
				chatLog == null ? "" : outputCleanChatLog(chatLog)
			}
		>
		</textarea>
	);
}

function MessageBoxInput(props) {
	return (
		<textarea id="messagebox-input" form="messagebox-form" rows="2" ></textarea>
	);
}

// possible enhancement - disable chat entirely for users who opt out
export function MessageBox (props) {
	return (
		<div id="messagebox">
			
			<div id="messagebox-main" style={{visibility: 'hidden'}}>

				<MessageBoxLog/> 
				<MessageBoxInput/>
				
			</div>

			<div id="messagebox-base">
				<span id='messagebox-label'>Chatbox</span>
				<span id='messagebox-indicator'
					onClick={() => {
						let currentVis = document.getElementById('messagebox-main').style.visibility;
						let newVis = currentVis == 'hidden' ? 'visible' : 'hidden';
						let newText = currentVis == 'hidden' ? 'Hide' : 'Expand';
						document.getElementById('messagebox-main').style.visibility = newVis;
						document.getElementById('messagebox-indicator').innerText = newText;
					}}>
					Expand</span>
			</div>

		</div>
	);
}
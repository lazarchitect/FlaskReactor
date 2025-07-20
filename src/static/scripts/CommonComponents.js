'use strict';

import React from 'react';

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

// TODO #32 - build wsSubscrbe for the message websocket, manage chat log state with react and update on WB receive.

function wsSubscribe (messageSocket) {

	messageSocket.send(
		JSON.stringify({
			"request": "subscribe",
			"gameId": payload.game.id,
			"username": payload.username
		})
	);
}

function wsConnect() {

	const messageSocket = new WebSocket(payload.wsBaseUrl + "/message");

	messageSocket.onopen = (() => 
		// TODO possible improvement - limit chat connection to only players (not spectators)
		wsSubscribe(messageSocket)
	);

	messageSocket.onmessage = (message) => {
		const messageData = JSON.parse(message.data);
		console.log(messageData);
		// TODO add message contents to chat log via setChatLog
	}

}

function MessageBoxLog(props) {
	
	let [chatLog, setChatLog] = React.useState(); // initial value can be blank, logs sent later during subscribe

	React.useEffect(() => wsConnect(chatLog, setChatLog), []);

	return (
		<textarea id="messagebox-log" readOnly></textarea>
	);
}

function MessageBoxInput(props) {
	return (
		<textarea value='' id="messagebox-input" rows='2' maxLength='68' required />
	);
}

// possible enhancement - disable chat entirely for users who opt out
export function MessageBox (props) {
	return (
		<div id="messagebox">
			
			<div id="messagebox-main" style={{visibility: 'hidden'}}>

				<MessageBoxLog/> 
				{/* TODO REACT NEEDS TO MANAGE THE STATE OF THE CHAT LOG */}
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
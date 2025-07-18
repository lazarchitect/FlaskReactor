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

// possible enhancement - disable chat entirely for users who opt out
export function MessageBox (props) {
	return (
		<div id="messagebox">
			
			<div id="messagebox-main" style={{visibility: 'hidden'}}>
				<form type='submit' method='post'>
					<textarea id="messagebox-textarea" readOnly></textarea>
					<textarea id="messagebox-input" rows='2' maxLength='68' required 
					onKeyDown={(e) => {
						console.log(e);
						if (e.key == 'Enter') {
							form.submit();
							// TODO:
							// send off message to Message websocket
							// add user message to message crawl
							// await receival of any messages coming in from websocket, to add to crawl as well.
						}
					}}>
							
					</textarea>
				</form>
			</div>

			<div id="messagebox-base">
				<span id='messagebox-text'>Chatbox</span>
				<span id='messagebox-indicator'
					onClick={() => {
						let currentVis = document.getElementById('messagebox-main').style.visibility;
						let newVis = currentVis == 'hidden' ? 'visible' : 'hidden';
						let newText = currentVis == 'hidden' ? 'Hide' : 'Expand';
						document.getElementById('messagebox-main').style.visibility = newVis;
						document.getElementById('chatbox-indicator').innerText = newText;
					}}>
					Expand</span>
			</div>

		</div>
	);
}
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
			
			<div id="messagebox-main">

			</div>
			<div id="messagebox-base" 
					onClick={() => {
						let currentVis = document.getElementById('messagebox-main').style.visibility;
						let newVis = currentVis == 'hidden' ? 'visible' : 'hidden';
						document.getElementById('messagebox-main').style.visibility = newVis;
						
						}}>
				<p><span id='chatbox-indicator'>Expand</span> Chatbox</p>
			</div>

		</div>
	);
}
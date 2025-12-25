'use strict';

import React, {useState} from 'react';
import {SettingsGearSVG} from "./SettingsGearSVG";

export function SiteHeader () {

	let {deployVersion, username} = payload;

	const isLoggedIn = username != null;

	const [settingsExpanded, setSettingsExpanded] = React.useState(false);

	return (
		<div id="siteHeader">

			<div id="headerLeft">
				<a href="/">FlaskReactor</a> (Version {deployVersion})
			</div>

			<div id="headerRight">

				<div id="settings" tabIndex={1}
						 onKeyDown={() => setSettingsExpanded(!settingsExpanded)}
						 onClick={() => setSettingsExpanded(!settingsExpanded)}>
					<SettingsGearSVG />
				</div>

				{settingsExpanded && <SettingsPane isLoggedIn={isLoggedIn} />}

				{isLoggedIn?
					<span id="headerUserText">
						{formatMax20(username)}
						<form id="logout" action="/logout" method="POST">
							<input type="submit" value="Log Out"/>
						</form>
					</span>
				: // else
					<span id="headerUserText">
						<a href="/">Log in / Sign up</a>
					</span>
				}
			</div>

		</div>
	)
}

function SettingsPane({isLoggedIn}) {

	const quadColors = ["red", "blue", "green", "teal", "orange", "purple"];
	const [quadColorPref, setQuadColorPref] = useState(payload.preferences.quadColorPref);
	//  TODO same DRY shit for quadColorBackup
	console.log(payload);

	return <div id="settingsPane">
		Settings
		<br/>
		{isLoggedIn?
			<>
				<span>Quadradius Color Preference: </span>
				<select id="quadColorPrefSelect" value={quadColorPref}
						onChange={(e) => {
							setQuadColorPref(e.target.value);
							updateSettings("quadColorPref", {"color": e.target.value})
						}} >
					{quadColors.map((item) =>
						<option key={item} value={item}>
							{item}
						</option>)
					}
				</select>
				<br/>
				<span>Opt out of chat?</span>
			</>
		: //  else
			<></>
		}
	</div>
}

function formatMax20(username) {
	if (username.length > 20) return username.slice(0, 17) + "...";
	return username;
}

function updateSettings(command, settingsData) {
	fetch("/receive_settings", {
		method: "PATCH",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({
			"command": command,
			"username": payload.username,
			// TODO need to authenticate this user somehow
			"data": settingsData})
	})
	.then(response => {
		if (response.statusText !== "ACCEPTED") alert("Settings update failed.");
	});

}
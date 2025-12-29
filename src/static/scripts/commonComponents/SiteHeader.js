'use strict';

import React, {useState} from 'react';
import {SettingsGearSVG} from "./SettingsGearSVG";

export function SiteHeader () {

	let {deployVersion, username} = payload;

	const isLoggedIn = username != null;

	const [settingsExpanded, setSettingsExpanded] = React.useState(false);

	return (
		<header>

			<div id="headerLeft">
				<a href="/">FlaskReactor</a> (Version {deployVersion})
			</div>

			<div id="headerRight">

				<div id="settings" onClick={() => setSettingsExpanded(!settingsExpanded)}>
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

		</header>
	)
}

function SettingsPane({isLoggedIn}) {

	let {preferences} = payload;

	const [quadColorPref, setQuadColorPref] = useState(preferences?.quadColorPref);
	const [quadColorBackup, setQuadColorBackup] = useState(preferences?.quadColorBackup);

	return <div id="settingsPane">
		Settings
		<br/>
		{isLoggedIn?
			<>
				<span>Quadradius Color Preference: </span>
				<QuadColorSelector command="quadColorPref" setter={setQuadColorPref} value={quadColorPref} />
				<br/>
				<span>Quadradius Color Backup: </span>
				<QuadColorSelector command="quadColorBackup" setter={setQuadColorBackup} value={quadColorBackup} />
				<br/>
				<span>Opt out of chat? -- yes/no slider</span>
			</>
		: //  else - settings visible while logged out? uses cookies?
			<></>
		}
	</div>
}

function QuadColorSelector({value, setter, command}) {
	const quadColors = ["red", "blue", "green", "teal", "orange", "purple"];
	return <select value={value}
			onChange={(e) => {
				setter(e.target.value);
				updateSettings(command, {"color": e.target.value})
			}} >
		{quadColors.map((item) =>
			<option key={item} value={item}>
				{item}
			</option>)
		}
	</select>
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
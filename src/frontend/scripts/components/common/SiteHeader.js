'use strict';

import React from 'react';
import {SettingsGearSVG} from "./SettingsGearSVG";
import {SettingsPane} from "./SettingsPane";

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

function formatMax20(username) {
	if (username.length > 20) return username.slice(0, 17) + "...";
	return username;
}


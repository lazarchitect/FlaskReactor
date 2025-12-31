'use strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';

function Warning ({message}) {
	return <span style={{color: "red", marginTop: "0", marginBottom: "0"}}>{message}</span>;
}

function LoginArea () {

	return <div>
		<h1>Log In</h1>
		<form action="/login" method="POST">
			<label>Username:</label>
			<input type="text" name="username" autoComplete="username"/>
			<br/><br/><br/>
			<label>Password:</label>
			<input type="password" name="password" autoComplete='current-password'/>
			<br/>
			<input type="submit" value="Submit"/>
		</form>
	</div>
}

function SignupArea() {

	let [passwordLength, setPasswordLength] = React.useState(0);
	let [repeatedLength, setRepeatedLength] = React.useState(0);
	let [passwordsMatch, setPasswordsMatch] = React.useState(false);

	document.addEventListener("keyup", (e) => {
		const username = document.getElementById('signupUsername').value;
		const password = document.getElementById('signupPassword').value;
		const repeated = document.getElementById('signupRepeated').value;
		const hasUsername = username.length > 0;
		const hasPassword = password.length > 8;
		const matchingPws = password === repeated;

		setPasswordLength(password.length);
		setRepeatedLength(repeated.length);
		setPasswordsMatch(matchingPws);

		const allConditionsMet = hasUsername && hasPassword && matchingPws;
		document.getElementById('signupSubmit').disabled = !allConditionsMet;
	});

	let passwordFocus = document.getElementById('signupPassword') === document.activeElement;
	let repeatedFocus = document.getElementById('signupPassword') === document.activeElement;
	let passwordLengthWarning = !passwordFocus && passwordLength > 0 && passwordLength <= 8;
	let passwordsMatchWarning = !repeatedFocus && !passwordsMatch && passwordLength > 0 && repeatedLength > 0;

	return <div>
		<h1>Sign Up</h1>
		<form action="/signup" method="POST">
			<label>Username:</label>
			<input type="text" id="signupUsername" name="username" autoComplete="username"/>
			<br/>
			<label>Password:</label>
			<input type="password" id="signupPassword" name="password" autoComplete="new-password"/>
			{passwordLengthWarning && <Warning message="Passwords must be longer than 8 characters." />}
			<br/>
			<label>Repeat Password:</label>
			<input type="password" id="signupRepeated" name="password_repeat" autoComplete="new-password"/>
			{!passwordLengthWarning && passwordsMatchWarning && <Warning message="Passwords must match." />}
			<br/>
			<label>Email (optional):</label>
			<input type="email" name="email" autoComplete="email"/>
			<br/>
			<input type="submit" id="signupSubmit" value="Submit"/>
		</form>
	</div>
}


const page = (
	<>
		<SiteHeader />
		<main>
			<p>FlaskReactor is a site for playing games online with your friends. Gaming will be free of charge for everyone, forever. Please make an account to get started!</p>
			<LoginArea/>
			<br/><br/>
			<SignupArea/>
		</main>
	</>
);

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(page);
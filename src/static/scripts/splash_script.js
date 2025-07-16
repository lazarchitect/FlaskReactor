'use strict';

import React from 'react'; // do I need this?
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './CommonComponents';

const LoginArea = (() =>
	<div>
		<h1>Log In</h1>
		<form action="/login" method="POST">
			<label>Username:</label>
			<input type="text" id="username" name="username"/>
			<br/><br/><br/>
			<label>Password:</label>
			<input type="password" name="password"/>
			<br/>
			<input type="submit" value="Submit"/>
		</form>
	</div>
);

const SignupArea = (() =>
	<div>
		<h1>Sign Up</h1>
		<form action="/signup" method="POST">
			<label>Username:</label>
			<input type="text" name="username"/>
			<br/>
			<label>Password:</label>
			<input type="password" name="password"/>
			<br/>
			<label>Repeat Password:</label>
			<input type="password" name="password_repeat"/>
			<br/>
			<label>Email (optional):</label>
			<input type="text" name="email"/>
			<br/>
			<input type="submit" value="Submit"/>
		</form>
	</div>
);


const page = (
	<div id="reactRoot">
		<SiteHeader username={null}/>
		<p>FlaskReactor is a site for playing games online with your friends. Gaming will be free of charge for everyone, forever. Please make an account to get started!</p>
		<LoginArea/>
		<br/><br/>
		<SignupArea/>
	</div>
);

var rootElement = document.getElementById("root");
var reactRoot = createRoot(rootElement);
reactRoot.render(page);

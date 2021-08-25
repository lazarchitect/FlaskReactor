

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


const reactRoot = (
	<div>
		<SiteHeader word="whatever I want."/>
		<LoginArea/>
		<br/><br/>
		<SignupArea/>
	</div>
);

const rootDiv = document.getElementById("root");

ReactDOM.render(reactRoot, rootDiv);

const LogoutButton = (() =>
	<form id="logout" action="/logout" method="POST">
		<input type="submit" value="Log Out"/>
	</form>
);

const SiteHeader = ((props) =>
	<span>{props.word}</span>

);
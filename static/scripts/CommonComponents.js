
const LogoutButton = (() =>
	<form id="logout" action="/logout" method="POST">
		<input type="submit" value="Log Out"/>
	</form>
);

const SiteHeader = ((props) =>
	<header id="siteHeader">
		<span>{
			props.username === null ? <a href="/">Log in / Sign up</a> : props.username			
		}</span>
	</header>

);
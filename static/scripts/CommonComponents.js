
class LogoutButton extends React.Component {

	render () {
		return <form action="/logout" method="POST"><input id="logout" type="submit" value="Log Out"/></form>;
	}

} 

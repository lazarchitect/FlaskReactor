
class LogoutButton extends React.Component {

	render () {
		return (
			<form id="logout" action="/logout" method="POST">
				<input type="submit" value="Log Out"/>
			</form>
		);
	}

} 

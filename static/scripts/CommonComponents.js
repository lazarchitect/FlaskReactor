


const SiteHeader = ((props) =>
	<div id="siteHeader">
		<span id="headerLeft">
			Welcome to FlaskReactor! (Version {payload.deployVersion})
		</span>
		<span id="headerRight">

			<span id="headerUsername">
				{props.username === null ? <a href="/">Log in / Sign up</a> : props.username}
			</span>

			{props.username != null ? 
				<form id="logout" action="/logout" method="POST">
					<input type="submit" value="Log Out"/>
				</form>
			: null }

		</span>
		
		
	</div>

);


var elem = (

	<div>

		<form action="/logout" method="POST">
			<input type="submit" value="Log Out"/>
		</form>

		<form action="/creategame" method="POST">
			Opponent Username: <input type="text" name="opponent"/>
			<br/>
			<input type="submit" value="Create"/>
		</form>

		<div>
			{games}
		</div>
	</div>

);


var rootDiv = document.getElementById("root");

ReactDOM.render(elem, rootDiv)
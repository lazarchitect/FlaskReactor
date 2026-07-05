import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {TttBoard} from "../components/ttt/tttBoard";

const isPlayer = payload.players.includes(payload.username);
const useChat = payload.preferences.useChat;

let {players} = payload;
const opponentName = isPlayer ? players.filter(player => player.username !== payload.username).pop() : null;

const titleAddition = " " + (isPlayer ? "Vs. " + opponentName : players[0] + " Vs. " + players[1]);
document.querySelector("title").innerText += titleAddition;

function Page(){
	return <>
		<SiteHeader/>
		<main>
			<div className="playArea">
				<h3>Tic-Tac-Toe{titleAddition}</h3>
				<TttBoard/>
				<p>Status: <span id="status"></span></p>
			</div>
			{isPlayer && useChat && <Chatbox expanded={false}/>}
		</main>
	</>
}

createRoot(document.getElementById('root')).render(<Page/>);
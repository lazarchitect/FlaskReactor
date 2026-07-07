import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {TttBoard} from "../components/ttt/tttBoard";
import {configureTitleAddition} from "./rootUtil";

const isPlayer = payload.players.includes(payload.username);
const use_chat = payload.preferences.use_chat;

const titleAddition = configureTitleAddition(payload.players);

function Page(){
	return <>
		<SiteHeader/>
		<main>
			<div className="playArea">
				<h3>Tic-Tac-Toe{titleAddition}</h3>
				<TttBoard/>
				<p>Status: <span id="status"></span></p>
			</div>
			{isPlayer && use_chat && <Chatbox expanded={false}/>}
		</main>
	</>
}

createRoot(document.getElementById('root')).render(<Page/>);
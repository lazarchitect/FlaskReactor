'use strict';

import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {Chessboard} from '../components/chess/Chessboard';
import {configureTitleAddition} from "./rootUtil";
import {sendResignation} from "../components/chess/chessSocket";

let players = [payload.game.white_player, payload.game.black_player];
const isPlayer = players.includes(payload.username);
const titleAddition = configureTitleAddition(players);

const use_chat = payload.preferences.use_chat;

function Page() {
    return <>
        <SiteHeader/>
        <main>
            <div className="playArea">
                <h3>Chess{titleAddition}</h3>
                <Chessboard/>
                <div id="belowChessboard">
                    <span id="chessStatus">Status: <span id="status"/></span>
                    <button onClick={sendResignation}>Resign?</button>
                </div>
            </div>

            {isPlayer && use_chat && <Chatbox expanded={false}/>}
        </main>
    </>
}

createRoot(document.getElementById('root')).render(<Page/>);
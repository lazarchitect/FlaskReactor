'use strict';

import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {Chessboard} from '../components/chess/Chessboard';

const useChat = payload.preferences.useChat;

let {players} = payload;
const isPlayer = players.includes(payload.username);
const opponentName = isPlayer ? players.filter(player => player.username !== payload.username).pop() : null;

console.log(useChat);
let page = (
	<>
        <SiteHeader />
        <main>
            <div className="playArea">
                {isPlayer && <h3>Chess game vs. {opponentName}</h3>}
                <Chessboard />
                <p id={"chessStatus"}>
                    Status: <span id="status"/>
                </p>
            </div>

            {isPlayer && useChat && <Chatbox expanded={false} />}
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);
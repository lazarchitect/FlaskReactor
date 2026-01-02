'use strict';

import React from 'react'; // used by Webpack
import { createRoot } from 'react-dom/client';
import { SiteHeader } from '../components/common/SiteHeader';
import { Chatbox } from '../components/common/Chatbox';
import { Chessboard } from '../components/chess/chessboard';

let {players} = payload;

let isPlayer = players.includes(payload.username);
let opponentName = isPlayer ? players.filter(player => player.username !== payload.username).pop() : null;

let page = (
	<>
        <SiteHeader />
        <main>
            <div className="playArea">
                {isPlayer && <h2>Vs. {opponentName}</h2>}
                <Chessboard />
                <p>Status: <span id="status"></span></p>
            </div>

            {isPlayer && <Chatbox expanded={false} />}
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);
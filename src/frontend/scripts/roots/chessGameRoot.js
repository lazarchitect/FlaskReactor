'use strict';

import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import SiteHeader from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {Chessboard} from '../components/chess/Chessboard';

const isPlayer = payload.players.includes(payload.username);
const useChat = payload.preferences.useChat;
console.log(useChat);
let page = (
	<>
        <SiteHeader />
        <main>
            <div className="playArea">
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
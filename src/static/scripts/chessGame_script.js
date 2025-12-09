'use strict';

import React from 'react'; // used by Webpack
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './commonComponents/SiteHeader';
import { Chatbox } from './commonComponents/Chatbox';
import { Chessboard } from './chessboard';


let isPlayer = payload.players.includes(payload.username);

var page = (
	<div id="reactRoot">
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        <div id="chessPlayArea">
            <Chessboard />
            <p>Status: <span id="status"></span></p>
        </div>
        
        {isPlayer && <Chatbox expanded={false} />}
        
    </div>
);

createRoot(document.getElementById('root')).render(page);
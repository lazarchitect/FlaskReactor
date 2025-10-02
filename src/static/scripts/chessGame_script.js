'use strict';

import React from 'react'; // used by Webpack
import { createRoot } from 'react-dom/client';
import { SiteHeader, MessageBox } from './CommonComponents';
import { Chessboard } from './chessboard';

var isPlayer = payload.players.includes(payload.username);

var page = (
	<div id="reactRoot">
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        <div id="chessPlayArea">
            <Chessboard boardstate={payload.boardstate}/>
            <p>Status: <span id="status"></span></p>
        </div>
        
        {isPlayer && <MessageBox/>}
        
    </div>
);

createRoot(document.getElementById('root')).render(page);
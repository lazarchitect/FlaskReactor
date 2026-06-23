'use strict';

import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {Chessboard} from '../components/chess/Chessboard';
import {PromotionModal} from "../components/chess/PromotionModal";

let isPlayer = payload.players.includes(payload.username);

let page = (
	<>
        <SiteHeader />
        <main>
            <div className="playArea">
                <Chessboard />
                <p>Status: <span id="status"></span></p>
            </div>

            {/*debug*/}
            <PromotionModal/>

            {isPlayer && <Chatbox expanded={false} />}
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);
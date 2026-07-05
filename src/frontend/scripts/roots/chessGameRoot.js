'use strict';

import React from 'react'; // used by Webpack
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {Chessboard} from '../components/chess/Chessboard';
import {configureTitleAddition} from "./rootUtil";

let {players} = payload;
const isPlayer = players.includes(payload.username);
const titleAddition = configureTitleAddition(players);

const useChat = payload.preferences.useChat;

function Page() {
    return <>
        <SiteHeader/>
        <main>
            <div className="playArea">
                <h3>Chess{titleAddition}</h3>
                <Chessboard/>
                <p id={"chessStatus"}>
                    Status: <span id="status"/>
                </p>
            </div>

            {isPlayer && useChat && <Chatbox expanded={false}/>}
        </main>
    </>
}

createRoot(document.getElementById('root')).render(<Page/>);
'use strict';

import React, {useState} from 'react'; // used by Webpack
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

function ResignButton({resign}) {
    const [doubleCheck, setDoubleCheck] = React.useState(false);
    const resignDoubleCheck = () => {setDoubleCheck(true); setTimeout(() => setDoubleCheck(false), 2000);};
    const resignConfirm = () => {resign(); sendResignation();}
    const {color, innerText, clickBehavior} = doubleCheck ?
        {color: 'red', innerText: 'Are you sure?', clickBehavior: resignConfirm} :
        {color: 'black', innerText: 'Resign', clickBehavior: resignDoubleCheck};
    return <button style={{color: color}} onClick={clickBehavior}>{innerText}</button>
}

function Page() {
    const [gameEnded, setGameEnded] = useState(payload.game.completed);
    return <>
        <SiteHeader/>
        <main>
            <div className="playArea">
                <h3>Chess{titleAddition}</h3>
                <Chessboard/>
                <div id="belowChessboard">
                    <span id="chessStatus">Status: <span id="status"/></span>
                    {!gameEnded && <ResignButton resign={() => setGameEnded(true)}/>}
                </div>
            </div>

            {isPlayer && use_chat && <Chatbox expanded={false}/>}
        </main>
    </>
}

createRoot(document.getElementById('root')).render(<Page/>);
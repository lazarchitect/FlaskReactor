'use strict';

import React, {useEffect} from 'react';
import {createRoot} from 'react-dom/client';

import {DndProvider} from "react-dnd";
import {HTML5Backend} from 'react-dnd-html5-backend';

import {SiteHeader} from '../components/common/SiteHeader';
import {Chatbox} from '../components/common/Chatbox';
import {QuadBoard} from '../components/quad/QuadBoard';
import {TorusDragLayer} from '../components/quad/TorusDragLayer';
import {quadSocketConnect} from "../components/quad/quadSocket";
import {Legend} from "../components/quad/Legend";

const isPlayer = [payload.game.player1, payload.game.player2].includes(payload.username);
const useChat = payload.preferences.useChat;

const isPlayer1 = payload.game.player1 === payload.username;
const powersList = isPlayer ? (isPlayer1 ? payload.game.player1_powers : payload.game.player2_powers) : null;
const legendData = {powersList: powersList, orb_countdown: payload.game.orb_countdown, turn_number: payload.game.turn_number };

function Page() {

    const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);
    const [legendState, setLegendState] = React.useState(legendData);

    useEffect(() => quadSocketConnect(setBoardstate, setLegendState), []);

	return <>
        <SiteHeader />
        <main>
            <div className="playArea">
                <DndProvider backend={HTML5Backend}>
                    <QuadBoard boardstate={boardstate} />
                    <TorusDragLayer />
                </DndProvider>
                <p>Status: <span id="status"></span></p>
            </div>
            <Legend legendState={legendState} />
            {isPlayer && useChat && <Chatbox expanded={false} />}
        </main>
    </>;
}

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(<Page />);

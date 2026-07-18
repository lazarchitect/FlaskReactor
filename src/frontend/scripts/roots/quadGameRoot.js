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
import {configureTitleAddition} from "./rootUtil";
import {ReconnectingPopUp} from "../components/common/ReconnectingPopUp";

const players = [payload.game.player1, payload.game.player2]; // send players array itself in payload?
const isPlayer = players.includes(payload.username);
const use_chat = payload.preferences.use_chat;

const isPlayer1 = payload.game.player1 === payload.username;
const powersList = isPlayer ? (isPlayer1 ? payload.game.player1_powers : payload.game.player2_powers) : null;
const legendData = {powersList: powersList, orb_countdown: payload.game.orb_countdown, turn_number: payload.game.turn_number };

const titleAddition = configureTitleAddition(players);

function Page() {

    const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);
    const [legendState, setLegendState] = React.useState(legendData);

    useEffect(() => quadSocketConnect(setBoardstate, setLegendState), []);

	return <>
        <SiteHeader />
        <main>
            <div className="playArea">
                <h3>Quadradius{titleAddition}</h3>
                <DndProvider backend={HTML5Backend}>
                    <QuadBoard boardstate={boardstate} />
                    <TorusDragLayer />
                </DndProvider>
                <p>Status: <span id="status"></span></p>
            </div>
            <Legend legendState={legendState} />
            <ReconnectingPopUp />
            {isPlayer && use_chat && <Chatbox expanded={false} />}
        </main>
    </>;
}

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(<Page />);

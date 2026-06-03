'use strict';

import React, {useEffect} from 'react';
import { createRoot } from 'react-dom/client';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SiteHeader } from '../components/common/SiteHeader';
import { Chatbox } from '../components/common/Chatbox';
import { QuadBoard } from '../components/quad/QuadBoard';
import { TorusDragLayer } from '../components/quad/TorusDragLayer';
import {quadSocketConnect} from "../components/quad/QuadSocket";
import {Legend} from "../components/quad/Legend";

const isPlayer = [payload.game.player1, payload.game.player2].includes(payload.username);

function Page() {

    const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);
    const [legendState, setLegendState] = React.useState(payload.game.legendState);

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
            { isPlayer && <Chatbox expanded={false} /> }
        </main>
    </>;
}

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(<Page />);

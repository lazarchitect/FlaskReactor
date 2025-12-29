'use strict';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SiteHeader } from './commonComponents/SiteHeader';
import { Chatbox } from './commonComponents/Chatbox';
import { QuadBoard } from './QuadBoard';
import { TorusDragLayer } from './TorusDragLayer';

const isPlayer = [payload.game.player1, payload.game.player2].includes(payload.username);

const page = (
	<div id="reactRoot">

        <SiteHeader />
        
        <main>
            <div id="quadPlayArea">
                <DndProvider backend={HTML5Backend}>
                    <QuadBoard />
                    <TorusDragLayer />
                </DndProvider>
                <p>Status: <span id="status"></span></p>
            </div>
            { isPlayer && <Chatbox expanded={false} /> }
        </main>
    </div>
);

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(page);

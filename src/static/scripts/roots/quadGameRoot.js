'use strict';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SiteHeader } from '../components/common/SiteHeader';
import { Chatbox } from '../components/common/Chatbox';
import { QuadBoard } from '../components/quad/QuadBoard';
import { TorusDragLayer } from '../components/quad/TorusDragLayer';

const isPlayer = [payload.game.player1, payload.game.player2].includes(payload.username);

const page = (
	<>

        <SiteHeader />
        
        <main>
            <div className="playArea">
                <DndProvider backend={HTML5Backend}>
                    <QuadBoard />
                    <TorusDragLayer />
                </DndProvider>
                <p>Status: <span id="status"></span></p>
            </div>
            { isPlayer && <Chatbox expanded={false} /> }
        </main>
    </>
);

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(page);

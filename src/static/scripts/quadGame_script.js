'use strict';

import React from 'react'; // required by React
import { createRoot } from 'react-dom/client';

import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SiteHeader } from './CommonComponents';
import { QuadBoard } from './QuadBoard';

var page = (
	<div id="reactRoot">

        {/* top of the page */}
        <SiteHeader version={payload.deployVersion} username={payload.username}/>
        
        {/* rest of the page */}
        <div id="quadPlayArea"> 
            <DndProvider backend={HTML5Backend}>
                <QuadBoard />
            </DndProvider>
            <p>Status: <span id="status"></span></p>
        </div>
        
    </div>
);

var rootElement = document.getElementById("root");
var reactRoot = createRoot(rootElement);
reactRoot.render(page);

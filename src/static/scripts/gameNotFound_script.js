import {createRoot} from "react-dom/client";
import {SiteHeader} from "./commonComponents/SiteHeader";
import React from "react";

let page = (
    <>
        <SiteHeader />
        <main>
            <p>
                Sorry, no game was found with that ID.
                Please try navigating to your game again and avoid manually changing the game ID.
            </p>
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);
import {createRoot} from "react-dom/client";
import {SiteHeader} from "../components/common/SiteHeader";
import React from "react";

let page = (
    <>
        <SiteHeader />
        <main>
            <p>
                Sorry, no game was found with that ID.
                <br/>
                Please try navigating to your game again and avoid manually changing the game ID.
                <br/>
                <a href={"/"}>Return to Home</a>
            </p>
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);
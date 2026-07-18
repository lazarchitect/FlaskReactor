import React, {useEffect, useState} from 'react';
import {createRoot} from "react-dom/client";

export const popupEvents = new EventTarget();

function ReconnectingPopUp() {

    const [display, setDisplay] = useState(false);

    useEffect(() => {
        const show = () => setDisplay(true);
        const hide = () => setDisplay(false);
        popupEvents.addEventListener('showReconnecting', show);
        popupEvents.addEventListener('hideReconnecting', hide);
        return () => { // returned callback gets run on unmount to avoid duplicate evenListeners or stale component assignments
            popupEvents.removeEventListener('showReconnecting', show);
            popupEvents.removeEventListener('hideReconnecting', hide);
        };
    }, []);

    if (!display) return null;
    return <div id="reconnectingPopUp">
        Server Connection Lost. Reconnecting...
    </div>
}

export function attachReconnectPopUp() {
    let container = document.createElement("div");
    document.body.appendChild(container);
    createRoot(container).render(<ReconnectingPopUp />);
}
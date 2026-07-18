import React, {useEffect, useState} from 'react';

export const popupEvents = new EventTarget();

export function ReconnectingPopUp() {

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

    return <div id="reconnectingPopUp" className={display? "show" : "hide"}>
        <span id="reconnectingText">Server Connection Lost - Reconnecting...</span>
        <img id="reconnectingDots" src='/frontend/images/common/reconnectingDots.svg' alt='Reconnecting' />
    </div>
}
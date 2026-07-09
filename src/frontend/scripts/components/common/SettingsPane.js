import React, {useContext} from "react";
import {PreferenceContext} from "./SiteHeader";

export function SettingsPane({isLoggedIn, expanded}) {

    // for performance reasons, we simply edit style instead of re-rendering for every click
    return <div id="settingsPane" style={{display: expanded ? 'block' : 'none'}}>
        Settings (refresh to see changes)
        <br/>
        {isLoggedIn ?
            <>
                <span>Quadradius Color Preference: </span>
                <QuadColorDropdown setting="quad_color_pref" />
                <br/>
                <span>Quadradius Color Backup: </span>
                <QuadColorDropdown setting="quad_color_backup" />
                <br/>
                <label htmlFor="useChatToggle">Use Chat?</label>
                <Toggle id="useChatToggle" setting="use_chat"/>
            </>
            : //  else - settings visible while logged out? uses cookies?
            <></>
        }
    </div>
}

function Toggle({id, setting}) {

    let {preferencesState, setPreferencesState} = useContext(PreferenceContext);
    let current = preferencesState[setting];

    let onChange = () => {
        setPreferencesState((prevState) => ({...prevState, [setting]: !current}));
        updateSettings(setting, !current)
    };

    return <input type="checkbox" id={id} checked={current} onChange={onChange}/>
}

// NOTE - users can select pref and backup as the same color, leading to mirror matches?
function QuadColorDropdown({setting}) {

    let {preferencesState, setPreferencesState} = useContext(PreferenceContext);
    let current = preferencesState[setting];

    const quadColors = ["james", "blue", "green", "cyan", "pink", "teal", "purple", "yellow", "orange"];

    let onChange = (event) => {
        setPreferencesState((prevState) => ({...prevState, [setting]: event.target.value}));
        updateSettings(setting, event.target.value)
    };

    return <select id={setting} value={current} onChange={onChange}>
        {quadColors.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
}

/** sends new settings preference to server for persistence. */
function updateSettings(setting, value) {
    fetch("/update_settings", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "setting": setting,
            "username": payload.username,
            "ws_token": payload.ws_token,
            "value": value
        })
    }).then(response => {
        if (response.statusText !== "ACCEPTED") alert("Settings update failed.");
    });
}
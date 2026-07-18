import React, {useContext} from "react";
import {PreferenceContext} from "./SiteHeader";

const QUAD_COLORS = ["red", "blue", "green", "cyan", "pink", "teal", "purple", "yellow", "orange"];
const CHESS_PIECE_SETS = ["default", "grecian"];

export function SettingsPane({expanded, isLoggedIn}) {

    // for performance reasons, we simply edit style instead of re-rendering for every click
    return <div id="settingsPane" className={expanded ? 'active' : ''}>
        <b>Settings</b> (refresh to see changes)
        <br/>
        {isLoggedIn ?
            <>
                <span>Quadradius Color Preference: </span>
                <Dropdown setting="quad_color_pref" options={QUAD_COLORS} />
                <br/>
                {/*NOTE - users can select pref and backup as the same color, leading to mirror matches?*/}
                <span>Quadradius Color Backup: </span>
                <Dropdown setting="quad_color_backup" options={QUAD_COLORS} />
                <br/>
                <label htmlFor="useChatToggle">Use Chat?</label>
                <Toggle id="useChatToggle" setting="use_chat"/>
                <br/>
                <span>Chess Piece Set: </span>
                <Dropdown setting="chess_piece_set" options={CHESS_PIECE_SETS}/>
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

function Dropdown({setting, options}) {

    let {preferencesState, setPreferencesState} = useContext(PreferenceContext);
    let current = preferencesState[setting];

    let onChange = (event) => {
        setPreferencesState((prevState) => ({...prevState, [setting]: event.target.value}));
        updateSettings(setting, event.target.value)
    };

    return <select id={setting} value={current} onChange={onChange}>
        {options.map((item) => <option key={item} value={item}>{item.toString()}</option>)}
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
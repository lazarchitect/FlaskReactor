import React, {useState} from "react";

export function SettingsPane({isLoggedIn}) {

    let {preferences} = payload;

    const [quadColorPref, setQuadColorPref] = useState(preferences?.quadColorPref);
    const [quadColorBackup, setQuadColorBackup] = useState(preferences?.quadColorBackup);
    const [useChat, setUseChat] = useState(preferences?.useChat);

    return <div id="settingsPane">
        Settings (refresh to see changes)
        <br/>
        {isLoggedIn ?
            <>
                <span>Quadradius Color Preference: </span>
                <QuadColorSelector command="quadColorPref" stateSetter={setQuadColorPref} current={quadColorPref}/>
                <br/>
                <span>Quadradius Color Backup: </span>
                <QuadColorSelector command="quadColorBackup" stateSetter={setQuadColorBackup}
                                   current={quadColorBackup}/>
                <br/>
                <label htmlFor="useChatToggle">Use Chat?</label>
                <BooleanSelector id="useChatToggle" command="useChat" stateSetter={setUseChat} current={useChat}/>
            </>
            : //  else - settings visible while logged out? uses cookies?
            <></>
        }
    </div>
}

function BooleanSelector({id, current, stateSetter, command}) {
    let onChange = () => {
        stateSetter(!current);
        updateSettings(command, {"value": !current});
    };
    return <input type="checkbox" id={id} checked={current} onChange={onChange}/>
}

function QuadColorSelector({current, stateSetter, command}) {
    const quadColors = ["red", "blue", "green", "teal", "orange", "purple"];

    let onChange = (e) => {
        stateSetter(e.target.value);
        updateSettings(command, {"color": e.target.value})
    };

    return <select value={current} onChange={onChange}>
        {quadColors.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
}

function updateSettings(command, settingsData) {
    fetch("/update_settings", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "command": command,
            "username": payload.username,
            // TODO need to authenticate this user somehow
            "data": settingsData
        })
    })
        .then(response => {
            if (response.statusText !== "ACCEPTED") alert("Settings update failed.");
        });

}
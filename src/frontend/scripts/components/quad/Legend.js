import React from 'react';

export function Legend({legendState}) {
    return <div id="legend">
        Turn number: {legendState.turn_number}<br/>
        Orb countdown: {legendState.orb_countdown}<br/><br/>
        {legendState.playerPowers && <PowersList playerPowers={legendState.playerPowers} />}
    </div>
}

function PowersList({playerPowers}) {

    let powerTotals = collatePowerTotals(playerPowers);

    function highlightTori(powerData) {
        const tori = powerData[1].tori;
        for (const torusName of tori) {
            const torusDiv = document.getElementById(torusName);
            const visual = torusDiv.querySelector(".torusSVGBody");
            visual.classList.add("torusPop");
            setTimeout(() => visual.classList.remove("torusPop"), 2000);
        }
    }

    return <div>
        Powers <br/>
        {Object.entries(powerTotals).map((powerData) =>
            <span key={powerData[0]} className="powerListing" onClick={() => highlightTori(powerData)}>
                {`${powerData[1].count}  ${powerData[0]}`}
            </span>)}
    </div>
}

/** returns a dict indicating what powers a player has. Each power has a count and a list of associated tori.
 * @return e.g. {name: "Refurb Radial", {tori: ["elegant_smith", "powered_winston"], count: 2}} */
function collatePowerTotals(playerPowers) {
    const powerTotals = {};
    Object.entries(playerPowers).forEach(torusPowerInfo => {
        const torusName = torusPowerInfo[0];
        const torusPowers = torusPowerInfo[1];
        Object.entries(torusPowers).forEach(power => {
            const powerName = power[0].replace(':', ' ');
            const count = power[1];
            if (powerName in powerTotals) {
                powerTotals[powerName].tori.push(torusName);
                powerTotals[powerName].count += count;
            }
            else {
                powerTotals[powerName] = {"tori": [torusName], count: count};
            }
        })
    })
    return powerTotals;
}
import React from 'react';

export function Legend({legendState}) {
    return <div id="legend">
        Turn number: {legendState.turn_number}<br/>
        Orb countdown: {legendState.orb_countdown}<br/><br/>
        {legendState.playerPowers && <PowersList playerPowers={legendState.playerPowers} />}
    </div>
}

function PowersList({playerPowers}) {

    let powersTotals = collatePowerTotals(playerPowers);
    return <div>
        Powers: <br/>
        {Object.entries(powersTotals).map((power) =>
            <span className="powerListing" key={power[0]}> {power[0]}: {power[1]} </span>)}
    </div>
}

/** returns a dict purely of {name: <power_name>, count: <power_count_across_all_tori>} */
function collatePowerTotals(playerPowers) {
    const powerTotals = {};
    Object.entries(playerPowers).forEach(torusPowerInfo => {
        const torusPowers = torusPowerInfo[1];
        Object.entries(torusPowers).forEach(power => {
            const name = power[0].replace(':', ' ');
            const count = power[1];
            if (name in powerTotals) powerTotals[name] += count;
            else powerTotals[name] = count;
        })
    })
    return powerTotals;
}
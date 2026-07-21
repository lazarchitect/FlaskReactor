import React from 'react';

export function Legend({legendState}) {
    return <div id="legend">
        Turn number: {legendState.turn_number}<br/>
        Orb countdown: {legendState.orb_countdown}<br/>
        Powers: <PowersList powersList={legendState.powersList} />
    </div>
}

function PowersList({powersList}) {
    return <div>
        {Object.entries(powersList).map(([name, count]) => <Power key={name} name={name} count={count} />)}
    </div>;
}

function Power({name, count}) {
    return <span>{name}: {count}</span>
}
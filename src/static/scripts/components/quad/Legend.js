import React from 'react';

export function Legend({legendState}) {

    return <div>
        <p>Orb countdown: {legendState.orb_countdown}</p>
        <div> Powers: <PowersList powers={legendState?.powers}/> </div>
    </div>
}

function PowersList({powers}) {

    return <div>
        {powers.map((_, power) => <Power name={power.name} count={power.count} />)}
    </div>
}

function Power({name, count}) {
    return <span>{name}: {count}</span>
}
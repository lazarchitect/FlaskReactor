import React from 'react';

export function Legend({legendState}) {

    return <div>
        <p>Orb countdown: </p>
        <div> Powers: <PowersList /> </div>
    </div>
}

function PowersList({}) {

    return <div>

    </div>
}

function Power({name, count}) {
    return <span>{name}: {count}</span>
}
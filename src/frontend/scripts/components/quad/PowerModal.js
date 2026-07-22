import React, {useRef} from "react";

export function PowerModal({powers}) {
    if (powers === undefined) return null;

    const thisElement = useRef(null);

    return <div className="powerModal" ref={thisElement}>
        {Object.entries(powers).map((power) =>
            <div className="powerModalEntry" key={power[0]}>
                {`${power[1]}  ${power[0].replace(':', ' ')}`}
            </div>)
        }
    </div>;
}
import React from "react";

export function TttBoardRow({yourTurn, rowIndex, values}) {
    // values is an array containing three cell data, e.g. ["X", "X", "O"]
    return (values).map((cellContents, colIndex) =>
        <span
            key={colIndex}
            className={"tttCell" + ((yourTurn && cellContents === "" && payload.username !== "") ? " activeTttCell" : "")}
            id={colIndex + (rowIndex * 3)}
            style={{left: 7 + (colIndex * 34) + "%", top: 7 + (rowIndex * 35) + "%"}}
        >
				{cellContents === "" ? "" : (cellContents === 'X' ? <X_Piece/> : <O_Piece/>)}
			</span>
    );
}

function X_Piece() {
    return (
        <svg width="70" height="70" xmlns="http://www.w3.org/2000/svg">
            <rect x="-6" y="9" width="10" height="80" rx="5" fill="#f1b42f" transform="rotate(-45)"/>
            <rect x="43" y="-40" width="10" height="80" rx="5" fill="#f1b42f" transform="rotate(45)"/>
        </svg>
    );
}

function O_Piece() {
    return (
        <svg width="70" height="70" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="35" r="27" stroke="#2f6cf1" strokeWidth="9" fill="transparent"/>
        </svg>
    );
}
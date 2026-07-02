import React from "react";
import {TttBoardRow} from "./tttElements";
import {tttSocketConnect} from "./tttSocket";

export function TttBoard() {

    const [boardstate, setBoardstate] = React.useState(payload.game.boardstate);

    const [yourTurn, setYourTurn] = React.useState(payload.yourTurn);

    React.useEffect(() => tttSocketConnect(setBoardstate, setYourTurn), []);

    return (
        <div id="tttBoard">

            <svg id="octothorpe" width="400px" height="400px" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <rect x="125" y="0" width="12" height="400" rx="5"/>
                <rect x="263" y="0" width="12" height="400" rx="5"/>
                <rect x="0" y="125" width="400" height="12" rx="5"/>
                <rect x="0" y="263" width="400" height="12" rx="5"/>
            </svg>
            <div id="tttBoardData">
                <TttBoardRow yourTurn={yourTurn} rowIndex={0} values={boardstate.slice(0, 3)}/><br/>
                <TttBoardRow yourTurn={yourTurn} rowIndex={1} values={boardstate.slice(3, 6)}/><br/>
                <TttBoardRow yourTurn={yourTurn} rowIndex={2} values={boardstate.slice(6, 9)}/><br/>
            </div>
        </div>
    )
}
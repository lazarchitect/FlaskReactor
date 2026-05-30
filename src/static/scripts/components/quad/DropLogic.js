import {useDrop} from "react-dnd";
import {Torus} from "./Torus";
import {quadSocketUpdate} from "./QuadSocket";

export function tileDropBehavior(boardstate, setBoardstate){
    return useDrop(() => ({
        accept: 'Torus',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            draggedItem: monitor.getItem(),
            monitor: monitor
        }),
        drop: ((draggedItem, monitor) => {

            // create a new boardstate memory representation for react rendering laziness
            const newBoardstate = [...boardstate];

            let sourceCoords = {row: draggedItem.row, col: draggedItem.col};
            let sourceTile = tileAtCoords(newBoardstate, sourceCoords);

            let targetCoords = coordsAtMouse(monitor.getClientOffset());
            let targetTile = tileAtCoords(newBoardstate, targetCoords);

            if (!isValidMove(draggedItem, monitor, newBoardstate)) return;

            targetTile.torus = sourceTile.torus;
            delete sourceTile.torus;

            setBoardstate(newBoardstate);

            quadSocketUpdate(sourceCoords, targetCoords);

        })
    }))
}

function coordsAtMouse(mousePos) {
    let rec = document.getElementById("quadboard").getBoundingClientRect();
    let boardStartX = rec.left + window.scrollX;
    let boardStartY = rec.top + window.scrollY;

    let [boardClickX, boardClickY] = [mousePos.x - boardStartX, mousePos.y - boardStartY];

    let cellHeight = rec.height / 8;
    let row = Math.floor(boardClickY / cellHeight);

    let cellWidth = rec.width / 10;
    let col = Math.floor(boardClickX / cellWidth);

    return {row: row, col: col};
}

function tileAtCoords(boardstate, coords) {
    return boardstate[coords.row][coords.col];
}

export function isValidMove(draggedItem, monitor, boardstate) {

    let sourceCoords = draggedItem;
    let sourceTile = tileAtCoords(boardstate, sourceCoords);

    let targetCoords = coordsAtMouse(monitor.getClientOffset());
    let targetTile = tileAtCoords(boardstate, targetCoords);

    let manhattanDistance = Math.abs(sourceCoords.row - targetCoords.row) + Math.abs(sourceCoords.col - targetCoords.col);
    let isInvalidDistance = manhattanDistance !== 1; // normal moves are exactly 1 orthogonal tile only (exceptions are Move Diagonal, F2S, Centerpult?)

    let allyAtTarget = ("torus" in targetTile && targetTile.torus.color === sourceTile.torus.color);

    return !isInvalidDistance && !allyAtTarget;
}
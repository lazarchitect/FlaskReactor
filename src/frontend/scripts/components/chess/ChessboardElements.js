import React from "react";
import {generatePieceMetadata} from "./chessUtils";

export function Row({rowIndex, tiles, highlightedTiles}) {

    let isDarkTile = rowIndex % 2 !== 0;

    let reactTileArray = [];
    for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {

        let tileId = rowIndex.toString() + tileIndex.toString();
        let isHighlightedTile = highlightedTiles.includes(tileId);

        reactTileArray.push(
            <Tile key={tileIndex} isDarkTile={isDarkTile} isHighlightedTile={isHighlightedTile} tileId={tileId}
                  tileData={tiles[tileIndex]}/>
        )
        isDarkTile = !isDarkTile;
    }

    return <div className="chessRow">{reactTileArray}</div>;
}

function Tile({isDarkTile, isHighlightedTile, tileId, tileData}) {

    const color = isDarkTile ? "dark" : "light";
    const className = `tile ${color}${isHighlightedTile ? "HighlightedTile" : "Tile"}`;

    return (
        <span key={tileId} className={className} id={tileId}>
			{ tileData.piece != null && <Piece piece={tileData.piece}/> }
		</span>
    );
}

export function Piece({piece}) {

    let {imagePath, altText} = generatePieceMetadata(piece);
    return <img src={imagePath} className="pieceImg" alt={altText}/>;
}
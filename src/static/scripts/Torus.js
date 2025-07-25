
import React from 'react';


export function Torus (props) {
    
    const [position, setPosition] = React.useState({x:0, y:0});
    const [dragStart, setDragStart] = React.useState({x:0, y:0});
    const [isDragging, setIsDragging] = React.useState(false);
    
    return <div
            id = {{}}
            className="torus"
            style={{
                cursor: "move",
                left: position.x,
                top: position.y
            }}

            onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({x: e.clientX, y: e.clientY});
            }}
            onMouseUp={(e) => setIsDragging(false)}
            /* ALERT! MOUSE UP WILL ONLY TRIGGER IF YOU MOUSEUP _WHILE_ OVER THE DIV! 
            SO YOU NEED TO TRACK MOUSE EVENTS OF THE WHOLE PAGE..? */

            onMouseMove={(e) => {

                if (!isDragging) {
                    return;
                }

                console.log("dragStart:" + dragStart.x + " "+  dragStart.y );
                console.log("position:" + position.x + " " + position.y);

                setPosition({
                    x: e.clientX - dragStart.x, // always bounces back to origin since mouseDown sets dragstart to client, so this evals to 0,0
                    y: e.clientY - dragStart.y 
                });
                // console.log(position);
            }}
            
        >
        <img className="torusImg" src="/static/images/quadradius/torus_default.png"></img>
    </div>
    
}


function Torus (props) {
    
    const [position, setPosition] = React.useState({x:0, y:0});
    const [dragStart, setDragStart] = React.useState({x:0, y:0});
    const [isDragging, setIsDragging] = React.useState(false);
    
    return <div 
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


            onMouseMove={(e) => {

                if (!isDragging) {
                    return;
                }

                console.log("dragStart:" + dragStart.x + " "+  dragStart.y );
                console.log("position:" + position.x + " " + position.y);

                setPosition({
                    x: dragStart.x - e.clientX,
                    y: dragStart.y - e.clientY
                });
                // console.log(position);
            }}
            
        >
        <img className="torusImg" src="/static/images/quadradius/torus_default.png"></img>
    </div>
    
}
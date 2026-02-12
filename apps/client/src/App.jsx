import Toolbar from "./Toolbar";
import DrawingCanvas from "./DrawingCanvas";
import { useReducer, useState } from "react";
import canvasReducer from "./canvasReducer";
import { getBoard } from "./boardApi";

function App() {
    const [tool, setTool] = useState("brush");
    const [color,setColor] = useState("#111827");
    const [canvasState, canvasDispatch] = useReducer(canvasReducer, {
        strokes: [],
        redoStack: [],
        lastAction: null
    }) 

    
    async function joinRoom(boardId) {
        const board = await getBoard(boardId);
        canvasDispatch({ type: "set-strokes", strokes: board.strokes });
    }


    return (
        <>
            <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} />
            <DrawingCanvas canvasState={canvasState} dispatch={canvasDispatch} tool={tool} color={color} />
        </>
    );
}

export default App;

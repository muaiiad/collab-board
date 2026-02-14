import Toolbar from "./Toolbar";
import DrawingCanvas from "./DrawingCanvas";
import { useReducer, useState } from "react";
import canvasReducer from "./canvasReducer";
import { getBoard } from "./boardApi";
import RoomManager from "./RoomManager";

function App() {
    const [tool, setTool] = useState("brush");
    const [color,setColor] = useState("#111827");
    const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
    const [canvasState, canvasDispatch] = useReducer(canvasReducer, {
        strokes: [],
        redoStack: [],
        lastAction: null
    }) 

    
    async function joinRoom(boardId) {
        const board = await getBoard(boardId);
        canvasDispatch({ type: "set-strokes", strokes: board.strokes });
    }

    async function createRoom() {
        const boardId = await fetch("http://localhost:3000/api/boards/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ strokes: canvasState.strokes })
        });
        return (await boardId.json())["id"];
    }

    return (
        <>
            <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} setIsRoomManagerOpen={setIsRoomManagerOpen} />
            <RoomManager onJoinRoom={joinRoom} onCreateRoom={createRoom} isOpen={isRoomManagerOpen} setIsOpen={setIsRoomManagerOpen} />
            <DrawingCanvas canvasState={canvasState} dispatch={canvasDispatch} tool={tool} color={color} />
        </>
    );
}

export default App;

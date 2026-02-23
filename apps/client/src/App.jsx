import Toolbar from "./ui/Toolbar.jsx";
import DrawingCanvas from "./DrawingCanvas";
import { useReducer, useState, useEffect } from "react";
import canvasReducer from "./canvasReducer";
import { getBoard } from "./boardApi";
import RoomManager from "./ui/RoomManager.jsx";
import useSocket from "./hooks/useSocket.js";


function App() {
    const [tool, setTool] = useState("brush");
    const [color,setColor] = useState("#111827");
    const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
    const [canvasState, canvasDispatch] = useReducer(canvasReducer, {
        strokes: [],
        redoStack: [],
        lastAction: null
    }) 
    const [currentId, setCurrentId] = useState(null);
    const socket = useSocket("http://localhost:3000");

    useEffect(() => {
        if (!socket.current) return;
        const currentSocket = socket.current;

        
        currentSocket.on("connect", () => {
            console.log(currentSocket.id); 
        });

        currentSocket.on("disconnect", () => {
            console.log(currentSocket.id); 
        });
        currentSocket.on("set-strokes", (strokes) => {
            console.log("received strokes");
            canvasDispatch({ type: "set-strokes", strokes });
        });
        return () => {
            currentSocket.off("connect");
            currentSocket.off("disconnect");
            currentSocket.off("set-strokes");
        }

    }, [socket]);

    async function joinRoom(boardId) {
        const board = await getBoard(boardId);
        canvasDispatch({ type: "set-strokes", strokes: board.strokes });
        setCurrentId(boardId);
    }

    async function createRoom() {
        const boardId = await fetch("http://localhost:3000/api/boards/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ strokes: canvasState.strokes })
        });
        const board = await boardId.json();
        setCurrentId(board.id);
        return board.id;
    }

    return (
        <>
            <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} setIsRoomManagerOpen={setIsRoomManagerOpen} />
            <div className="fixed inset-x-0 top-20 flex justify-center">
                <div className="rounded-md bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm backdrop-blur">
                    Room ID: {currentId ?? "Not connected"}
                </div>
            </div>
            <RoomManager onJoinRoom={joinRoom} onCreateRoom={createRoom} isOpen={isRoomManagerOpen} setIsOpen={setIsRoomManagerOpen} />
            <DrawingCanvas canvasState={canvasState} dispatch={canvasDispatch} tool={tool} color={color} socket={socket} />
        </>
    );
}

export default App;

import Toolbar from "./ui/Toolbar.jsx";
import DrawingCanvas from "./board/DrawingCanvas.jsx";
import { useReducer, useState, useEffect } from "react";
import canvasReducer from "./board/canvasReducer.js";
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
        socket.current.emit("join-room", boardId, async (response) => {
            if (response.success) {
                canvasDispatch({ type: "set-strokes", strokes: response.canvas.strokes })
                setCurrentId(boardId)
            } else {
                console.error("Failed to join room:", response);
            }
        });
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
        joinRoom(board.id);
        return board.id;
    };

    return (
        <>
            <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} setIsRoomManagerOpen={setIsRoomManagerOpen} />
            <div className="fixed inset-x-0 top-20 flex justify-center">
                <div className="rounded-md bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm backdrop-blur">
                    Room ID: {currentId ?? "Not connected"}
                </div>
            </div>
            <RoomManager onJoinRoom={joinRoom} onCreateRoom={createRoom} isOpen={isRoomManagerOpen} setIsOpen={setIsRoomManagerOpen} />
            <DrawingCanvas canvasState={canvasState} dispatch={canvasDispatch} tool={tool} color={color} socket={socket} boardId={currentId} />
        </>
    );
}

export default App;

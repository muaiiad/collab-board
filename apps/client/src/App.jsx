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
    const [roomsAnchor, setRoomsAnchor] = useState(null);
    const [canvasState, canvasDispatch] = useReducer(canvasReducer, {
        strokes: {},
        undoStack: [],
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
            console.log(strokes);
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
            <Toolbar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                isRoomManagerOpen={isRoomManagerOpen}
                setIsRoomManagerOpen={setIsRoomManagerOpen}
                onRoomsButtonLayout={setRoomsAnchor}
            />
            <div className="fixed inset-x-0 bottom-0 flex justify-end">
                <div className={`rounded-md bg-transparent px-3 py-1 text-sm ${currentId != null ? "text-green-800" : "text-gray-700"}`}>
                    Room ID: {currentId ?? "Not connected"}
                </div>
            </div>
            <RoomManager
                onJoinRoom={joinRoom}
                onCreateRoom={createRoom}
                isOpen={isRoomManagerOpen}
                setIsOpen={setIsRoomManagerOpen}
                anchor={roomsAnchor}
            />
            <DrawingCanvas canvasState={canvasState} dispatch={canvasDispatch} tool={tool} color={color} socket={socket} boardId={currentId} />
        </>
    );
}

export default App;

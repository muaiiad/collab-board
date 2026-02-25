import { useState } from "react";

export default function RoomManager({ onJoinRoom, onCreateRoom , isOpen, setIsOpen, anchor }) {
    const [view, setView] = useState("home");
    const [createdCode, setCreatedCode] = useState("");
    const [joinCode, setJoinCode] = useState("");


    let content = null;
    
    if (view === "create") {
        content = (
            <div className="space-y-3">
                <h1 className="text-sm font-semibold text-gray-900">Create Room</h1>
                <p className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                    {createdCode || "Room code will appear here."}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCreatedCode(onCreateRoom())}
                        className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                    >
                        Create
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("home")}
                        className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200 cursor-pointer"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    } else if (view === "join") {
        content = (
            <div className="space-y-3">
                <h1 className="text-sm font-semibold text-gray-900">Join Room</h1>
                <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter room code"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
                />
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onJoinRoom(joinCode)}
                        className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                    >
                        Join
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("home")}
                        className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200 cursor-pointer"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    } else if (view === "home") {
        content = (
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={() => setView("create")}
                    className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                >
                    Create Room
                </button>
                <button
                    type="button"
                    onClick={() => setView("join")}
                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200 cursor-pointer"
                >
                    Join Room
                </button>
            </div>
        );
    }

    const panelStyle = anchor
        ? {
            top: `${anchor.top}px`,
            left: `min(${Math.round(anchor.right + 8)}px, calc(100vw - 21rem))`,
        }
        : undefined;

    return (
        <>
            {isOpen && (
                <div
                    id="rooms-panel"
                    style={panelStyle}
                    className="fixed z-20 w-80 rounded-xl border border-gray-200 bg-gray-100/90 p-4 shadow-lg backdrop-blur"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Room Manager</p>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                    {content}
                </div>
            )}
        </>
    );
}

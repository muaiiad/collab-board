import { useState } from "react";

function generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        code += chars[idx];
    }
    return code;
}

function RoomManager({ onJoinRoom, onCreateRoom }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("options");
    const [createdCode, setCreatedCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [copyLabel, setCopyLabel] = useState("Copy Code");

    function openModal() {
        setIsOpen(true);
        setView("options");
        setCreatedCode("");
        setJoinCode("");
        setCopyLabel("Copy Code");
    }

    function closeModal() {
        setIsOpen(false);
    }

    function handleCreateRoom() {
        const nextCode = generateRoomCode();
        setCreatedCode(nextCode);
        setView("created");
        if (onCreateRoom) {
            onCreateRoom(nextCode);
        }
    }

    async function handleCopyCode() {
        if (!createdCode || !navigator.clipboard) return;
        await navigator.clipboard.writeText(createdCode);
        setCopyLabel("Copied");
        window.setTimeout(() => setCopyLabel("Copy Code"), 1200);
    }

    function handleJoinCodeChange(e) {
        const nextValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        setJoinCode(nextValue.slice(0, 5));
    }

    async function handleJoin() {
        const code = joinCode.trim().toUpperCase();
        if (!code) return;
        if (onJoinRoom) {
            await onJoinRoom(code);
        }
        closeModal();
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="fixed right-4 top-4 z-40 inline-flex h-16 items-center rounded-lg border border-gray-200 bg-white/80 px-6 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer backdrop-blur"
            >
                Rooms
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-sm min-h-64 rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close modal"
                            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            ×
                        </button>

                        {view === "options" && (
                            <div className="flex min-h-56 flex-col justify-center gap-3 pt-4">
                                <h2 className="text-center text-lg font-semibold text-gray-800">Rooms</h2>
                                <button
                                    type="button"
                                    onClick={handleCreateRoom}
                                    className="h-10 w-full rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                >
                                    Create Room
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("join")}
                                    className="h-10 w-full rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                >
                                    Join Room
                                </button>
                            </div>
                        )}

                        {view === "created" && (
                            <div className="flex min-h-56 flex-col justify-center gap-3 pt-4">
                                <h2 className="text-center text-lg font-semibold text-gray-800">Room Created</h2>
                                <div className="rounded-md bg-gray-100 py-3 text-center text-2xl font-semibold tracking-[0.2em] text-gray-800">
                                    {createdCode}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    className="h-10 w-full rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                >
                                    {copyLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="h-10 w-full rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                        {view === "join" && (
                            <div className="flex min-h-56 flex-col justify-center gap-3 pt-4">
                                <h2 className="text-center text-lg font-semibold text-gray-800">Join Room</h2>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={handleJoinCodeChange}
                                    placeholder="Enter room code"
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-center uppercase tracking-[0.14em] text-gray-800 outline-none focus:border-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleJoin}
                                    className="h-10 w-full rounded-md bg-gray-200 text-sm text-gray-800 hover:bg-gray-300 cursor-pointer"
                                >
                                    Join
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("options")}
                                    className="h-10 w-full rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default RoomManager;

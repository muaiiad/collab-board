import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import Queue from "./helpers/queue.js";

const strokeQueue = new Queue();
const boards = {}
const allowedOrigin = "http://localhost:5173";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigin,
    },
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.post("/api/boards/create", (req,res) => {
    const canvas = req.body;
    console.log("request made to create board");
    const makeId = (n = 6) => {
        let s = "";
        while (s.length < n) s += Math.random().toString(36).slice(2);
        return s.slice(0, n);
    };
    const boardId = makeId(6);
    boards[boardId] = canvas
    console.log(boards);
    res.json({ id: boardId })
})

app.get("/api/boards/:boardId", (req, res) => {
    const boardId = req.params.boardId
    res.json(boards[boardId])
});


io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("add-stroke", (data) => {
        const { stroke, boardId } = data;
        if (!boards[boardId]) {
            console.error("Invalid board ID:", boardId);
            return;
        }
        console.log("received stroke", stroke.id);
        boards[boardId].strokes[stroke.id] = stroke;
        socket.to(boardId).emit("set-strokes", boards[boardId].strokes);
    });

    socket.on("stroke-batch", (data) => {
        const { points, strokeId, boardId } = data;
        if (!points || !strokeId || !boardId) {
            console.error("Invalid batch data:", data);
            return;
        }
        console.log("received batch for stroke", strokeId, "with", points.length, "points");
        if (!boards[boardId]) {
            console.error("Invalid board ID:", boardId);
            return;
        }
        if (!boards[boardId].strokes[strokeId]) {
            boards[boardId].strokes[strokeId] = { id: strokeId, points: [] };
        }
        boards[boardId].strokes[strokeId].points.push(...points);
        socket.to(boardId).emit("set-strokes", boards[boardId].strokes);
    });


    socket.on("delete-stroke", (data) => {
        const { id, boardId } = data;
        if (!boards[boardId]) {
            console.error("Invalid board ID:", boardId);
            return;
        }
        console.log("deleting stroke", id);
        delete boards[boardId].strokes[id];
        socket.to(boardId).emit("set-strokes", boards[boardId].strokes);
    });

    socket.on("join-room", (boardId, callback) => {
    if (!boards[boardId]) {
        return callback({ success: false, error: "Invalid board ID" });
    }

    socket.join(boardId);
    callback({ success: true, canvas: boards[boardId] });
    });
});

httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

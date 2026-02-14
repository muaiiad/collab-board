import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";


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
    // ...
});

httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import strokes from "./strokes.js";


const allowedOrigin = "http://localhost:5173";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigin,
    },
});

app.use(cors({ origin: allowedOrigin }));
const sampleBoard = {
    id: "board-test-1",
    name: "Sample Board",
    strokes,
};

app.get("/test", (_req, res) => {
    res.json(sampleBoard);
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

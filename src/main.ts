import express, { Response } from "express";
import http from "http";
import WebSocket from "ws";
import { PORT } from "./config/constants";
import { loginUser } from "./controllers/auth";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.post("/api/login", loginUser);

wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (message: string) => {
        try {
            // Handle WebSocket message
        } catch (error) {
            // Handle errors
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

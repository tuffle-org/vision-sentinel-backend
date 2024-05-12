import express from "express";
import http from "http";
import WebSocket from "ws";
import { PORT } from "./config/constants";
import { loginUser } from "./controllers/auth";
import { setupWebSocketServer } from "./websocket";
import { authMiddleware } from "./middlewares/auth";
import {
    createUser,
    deleteUser,
    getUser,
    updateInOut,
    updateUser,
} from "./controllers/users";

const app = express();
const server = http.createServer(app);
export const wss = new WebSocket.Server({ server });

app.use(express.json());

setupWebSocketServer(wss);

app.post("/api/login", loginUser);

app.post("/api/create-user", authMiddleware, createUser);
app.get("/api/get-user", authMiddleware, getUser);
app.post("/api/update-user/:id", authMiddleware, updateUser);
app.delete("/api/delete-user/:id", authMiddleware, deleteUser);
app.post("/api/update-status/:id", authMiddleware, updateInOut);

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

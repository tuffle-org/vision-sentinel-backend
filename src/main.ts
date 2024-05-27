import express from "express";
import http from "http";
import WebSocket from "ws";
import { PORT } from "./config/constants";
import { loginUser, passwordChange } from "./controllers/auth";
import { setupWebSocketServer } from "./websocket";
import { authMiddleware } from "./middlewares/auth";
import {
    createUser,
    deleteUser,
    getUser,
    updateInOut,
    updateInOutMultiple,
    updateUser,
    uploadUsers,
} from "./controllers/users";

const app = express();
const server = http.createServer(app);
export const wss = new WebSocket.Server({ server });

// Increase the maximum allowed payload size to 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

setupWebSocketServer(wss);

app.post("/api/login", loginUser);
app.post("/api/password-change", passwordChange);

app.post("/api/create-user", authMiddleware, createUser);
app.get("/api/get-user", authMiddleware, getUser);
app.post("/api/update-user/:id", authMiddleware, updateUser);
app.post("/api/upload-user/", authMiddleware, uploadUsers);
app.post("/api/upload-logs/", authMiddleware, updateInOutMultiple);
app.delete("/api/delete-user/:id", authMiddleware, deleteUser);
app.post("/api/update-status/:id", authMiddleware, updateInOut);

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

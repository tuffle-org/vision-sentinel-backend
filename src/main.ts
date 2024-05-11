import express from "express";
import http from "http";
import WebSocket from "ws";
import { PORT } from "./config/constants";
import { loginUser } from "./controllers/auth";
import { setupWebSocketServer } from "./websocket";
import { authMiddleware } from "./middlewares/auth";
import { createUser, getUser } from "./controllers/users";
import multer from "multer";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define storage settings for multer
const storage = multer.memoryStorage();
// Initialize multer with storage settings
const upload = multer({ storage: storage });

app.use(express.json());

app.post("/api/login", loginUser);

setupWebSocketServer(wss);

// app.use(authMiddleware);

app.use(
    "/api/create-user",
    authMiddleware,
    upload.single("user_image"),
    createUser
);
app.use("/api/get-user", authMiddleware, getUser);

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

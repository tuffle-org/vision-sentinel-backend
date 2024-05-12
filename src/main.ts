import express from "express";
import http from "http";
import WebSocket from "ws";
import { PORT } from "./config/constants";
import { loginUser } from "./controllers/auth";
import { setupWebSocketServer } from "./websocket";
import { authMiddleware } from "./middlewares/auth";
import { createUser, getUser } from "./controllers/users";
import multer from "multer";
import path from "path";

const app = express();
export const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define storage options for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination directory for uploaded files
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        // Use the original file name as the uploaded file name
        cb(null, file.originalname);
    },
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

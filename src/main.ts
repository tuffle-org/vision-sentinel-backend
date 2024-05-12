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
import multer from "multer";
import path from "path";

const app = express();
const server = http.createServer(app);
export const wss = new WebSocket.Server({ server });

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

// Initialize multer with storage settings
const upload = multer({ storage: storage });

app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../uploads")));

setupWebSocketServer(wss);

app.post("/api/login", loginUser);

app.post(
    "/api/create-user",
    authMiddleware,
    upload.single("user_image"),
    createUser
);
app.get("/api/get-user", authMiddleware, getUser);
app.patch("/api/update-user/:id", authMiddleware, updateUser);
app.delete("/api/delete-user/:id", authMiddleware, deleteUser);
app.post("/api/update-status/:id", authMiddleware, updateInOut);

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

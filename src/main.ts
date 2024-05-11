import express, { Response } from "express";
import http from "http";
import WebSocket from "ws";
import { PrismaClient } from "@prisma/client";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const prisma = new PrismaClient();

app.use(express.json());

wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (message: string) => {
        try {
            // Handle WebSocket message
        } catch (error) {
            // Handle errors
        }
    });
});

app.get("/users", async (_, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

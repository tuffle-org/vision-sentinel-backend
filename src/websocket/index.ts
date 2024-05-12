// websocketServer.ts

import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { verifyToken } from "../services/auth";
import prisma from "../config/prisma";
import { wss } from "../main";

interface CustomWebSocket extends WebSocket {
    token?: string;
}

export function setupWebSocketServer(wss: WebSocket.Server): WebSocket.Server {
    wss.on("connection", (ws: CustomWebSocket, req: IncomingMessage) => {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            console.log("No token provided, closing connection");
            ws.close();
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            console.log("Invalid token, closing connection");
            ws.close();
            return;
        }

        ws.token = token; // Assign token to WebSocket object

        ws.on("message", async (message: string) => {
            console.log(`Received message for token ${token}: ${message}`);

            // Parse message JSON
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch (error) {
                console.error(`Error parsing message: ${error}`);
                return;
            }
        });

        console.log(`User with token ${token} connected`);
    });

    return wss;
}

// Function to broadcast message to all WebSocket clients
export function broadcastMessage(type: string, data: any) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: type, data }));
        }
    });
}

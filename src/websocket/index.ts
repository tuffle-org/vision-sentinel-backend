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

            // Determine message type
            const messageType = parsedMessage.type;

            console.log("Size of clients : ", wss.clients.size);
            // Handle different message types
            switch (messageType) {
                case "user_creation":
                    const data = parsedMessage.data;
                    console.log(data);
                    const bufferFaceData = Buffer.from(
                        data.face_data,
                        "base64"
                    );

                    const userCreateObj = await prisma.user.create({
                        data: {
                            user_id: data.user_id,
                            user_image: data.user_image,
                            user_name: data.user_name,
                            group: data.group,
                            expiry_date: data.expiry_date,
                            created_at: Date(),
                            updated_at: Date(),
                            user_status: "",
                            face_data: bufferFaceData,
                        },
                    });
                    // Send message to appropriate channel (based on token or user ID)
                    wss.clients.forEach((client: CustomWebSocket) => {
                        if (
                            client !== ws &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            client.send(JSON.stringify(userCreateObj));
                        }
                    });
                    break;
                case "list_update":
                    // Send message to appropriate channel (based on token or user ID)
                    // Example: Broadcast to all clients
                    wss.clients.forEach((client: CustomWebSocket) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(parsedMessage));
                        }
                    });
                    break;
                case "delete":
                    // Handle delete event...
                    break;
                default:
                    console.error(`Unknown message type: ${messageType}`);
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

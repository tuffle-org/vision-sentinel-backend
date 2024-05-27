import { Request, Response } from "express";
import prisma from "../config/prisma";
import { broadcastMessage } from "../websocket";
import { Prisma } from "@prisma/client";

export async function createUser(req: Request, res: Response) {
    try {
        const {
            user_id,
            user_name,
            group,
            expiry_date,
            user_status,
            face_data,
            user_image,
        } = req.body as any;

        // Validate user data (add more validation as needed)
        if (!user_id || !user_name || !group || !expiry_date) {
            res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: { user_id },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "User already exists with this user_id" });
        }

        // const user_image = req.file; // Access the uploaded file buffer

        // Check if user_image is undefined
        // if (!user_image) {
        //     return res.status(400).json({ error: "No file uploaded" });
        // }

        // Start a Prisma transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Insert user into the database
            const newUser = await prisma.user.create({
                data: {
                    user_id,
                    user_name,
                    user_image,
                    group,
                    expiry_date,
                    created_at: new Date(),
                    updated_at: new Date(),
                    user_status: user_status || "Registration",
                    face_data: face_data,
                },
            });
            console.log(newUser);

            // Create log entry for user registration
            const log = await prisma.log.create({
                data: {
                    user_id: newUser.user_id,
                    event_type: "Registration",
                },
            });

            // Return both the user and the log entry
            return { newUser, log };
        });

        // Broadcast the log entry to WebSocket clients
        broadcastMessage("user_created", {
            log: result.log,
            user: result.newUser,
        });

        res.status(200).json(result.newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        // Insert user into the database using Prisma
        const users = await prisma.user.findMany({
            select: {
                face_data: true,
                user_id: true,
                user_image: true,
                user_name: true,
                user_status: true,
                expiry_date: true,
                group: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const {
            user_id,
            user_name,
            group,
            expiry_date,
            face_data,
            user_image,
        } = req.body as any;

        const userId: string = req.params.id as string;
        console.log(userId, "updated at user ");

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: { user_id },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const updateObj: any = {
            user_name,
            group,
            expiry_date,
        };

        // Check if user_image is not undefined
        if (user_image) {
            updateObj.user_image = user_image;
        }
        if (face_data) {
            updateObj.face_data = face_data;
        }

        // Update user in the database using Prisma
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: updateObj,
        });
        console.log(updatedUser, "up");

        const log = await prisma.log.create({
            data: {
                user_id: updatedUser.user_id,
                event_type: "Update",
            },
        });

        broadcastMessage("user_updated", {
            log: log,
            user: updatedUser,
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        // Extract userId from request parameters
        const userId: string = req.params.id as string;

        // Check if userId is present
        if (!userId) {
            return res.status(400).json({ error: "Missing user ID" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: { user_id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete user from the database using Prisma
        const user = await prisma.user.delete({
            where: { user_id: userId },
        });

        broadcastMessage("user_deleted", user);

        // Return success message
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
}

export async function updateInOut(req: Request, res: Response) {
    try {
        console.log(req.query, req.params, req.body);
        // Extract userId and status from request
        const userId: string = req.params.id as string;
        const { status }: { status: "In" | "Out" } = req.body;

        // Check if userId and status are present
        if (!userId || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: { user_id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Update user's status in the database
            const updatedUser = await prisma.user.update({
                where: { user_id: userId },
                data: { user_status: status },
            });
            console.log(updateUser);

            // Create log entry for user status update
            const log = await prisma.log.create({
                data: {
                    user_id: updatedUser.user_id,
                    event_type: status,
                },
            });

            // Broadcast message
            broadcastMessage("user_status_update", { log, user: updateUser });

            // Return updated user and log entry
            return { updatedUser, log };
        });

        // Return the updated user as a response
        res.status(200).json(result.updatedUser);
    } catch (error) {
        // Handle errors
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user status" });
    }
}

export async function uploadUsers(req: Request, res: Response) {
    try {
        const users = JSON.parse(req.body.data) as any[];

        // Validate that users array is provided
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "No users provided" });
        }

        // Filter out duplicate user_id entries
        const uniqueUsers = users.filter(
            (user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
        );

        const userCreationPromises = uniqueUsers.map(async (user) => {
            const {
                id: user_id,
                name: user_name,
                group,
                expired: expiry_date,
                user_status = "Registration",
                faceJpg: user_image,
                templates: face_data,
            } = user;

            // Validate user data
            if (!user_id || !user_name || !group || !expiry_date) {
                throw new Error("Missing required fields for user: " + user_id);
            }

            // Check if user exists
            const existingUser = await prisma.user.findFirst({
                where: { user_id },
            });
            if (existingUser) {
                console.log(
                    `User with user_id: ${user_id} already exists. Skipping...`
                );
                return null;
            }

            return {
                user_id,
                user_name,
                group,
                expiry_date,
                user_status: user_status || "Registration",
                face_data: JSON.stringify(face_data),
                user_image: JSON.stringify(user_image),
                created_at: new Date(),
                updated_at: new Date(),
            };
        });

        const userData = await Promise.all(userCreationPromises);
        const newUsers = userData.filter(
            (user) => user !== null
        ) as Prisma.UserCreateManyInput[];

        if (newUsers.length === 0) {
            return res.status(400).json({ error: "No valid users to create" });
        }

        // Start a Prisma transaction to create users and log entries
        const result = await prisma.$transaction(async (prisma) => {
            const createdUsers = await prisma.user.createMany({
                data: newUsers,
            });

            const logs: Prisma.LogCreateManyInput[] = newUsers.map((user) => ({
                user_id: user!.user_id, // Non-null assertion since we filtered nulls out
                event_type: "Registration",
            }));

            await prisma.log.createMany({
                data: logs,
            });

            return createdUsers;
        });

        // Broadcast the log entries to WebSocket clients
        newUsers.forEach((user) => {
            broadcastMessage("user_created", {
                log: { user_id: user!.user_id, event_type: "Registration" }, // Non-null assertion
                user,
            });
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error creating users:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateInOutMultiple(req: Request, res: Response) {
    try {
        console.log(req.query, req.params, req.body);
        // Extract users array from request body
        const users = JSON.parse(req.body.data) as {
            user_id: string;
            type: "In" | "Out";
            date: Date;
        }[];

        // Validate that users array is provided
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "No users provided" });
        }

        // Prepare update promises
        const updatePromises = users.map(async (user) => {
            const { user_id: userId, type: status, date } = user;

            // Check if userId and status are present
            if (!userId || !status) {
                console.warn(`Missing required fields for user: ${userId}`);
                return null; // Skip this user
            }

            // Check if user exists
            const existingUser = await prisma.user.findFirst({
                where: { user_id: userId },
            });
            if (!existingUser) {
                console.log(
                    `User with user_id: ${userId} not found. Skipping...`
                );
                return null;
            }

            return { user_id: userId, event_type: status, date_time: date };
        });

        const validUsers = (await Promise.all(updatePromises)).filter(
            (user) => user !== null
        ) as { user_id: string; event_type: "In" | "Out"; date_time: Date }[];

        if (validUsers.length === 0) {
            return res.status(400).json({ error: "No valid users to update" });
        }

        // Start a Prisma transaction to update user statuses and create log entries
        const result = await prisma.$transaction(async (prisma) => {
            const updateResults = await Promise.all(
                validUsers.map(async (user) => {
                    const updatedUser = await prisma.user.update({
                        where: { user_id: user.user_id },
                        data: { user_status: user.event_type },
                    });

                    const log = await prisma.log.create({
                        data: {
                            user_id: updatedUser.user_id,
                            event_type: user.event_type,
                        },
                    });

                    // Broadcast message
                    broadcastMessage("user_status_update", {
                        log,
                        user: updatedUser,
                    });

                    return { updatedUser, log };
                })
            );

            return updateResults;
        });

        // Return the updated users as a response
        res.status(200).json(result.map((r) => r.updatedUser));
    } catch (error: any) {
        // Handle errors
        console.error("Error updating users:", error.message);
        res.status(500).json({ error: "Failed to update user statuses" });
    }
}

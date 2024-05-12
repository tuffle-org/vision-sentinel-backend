import { Request, Response } from "express";
import prisma from "../config/prisma";

export async function createUser(req: Request, res: Response) {
    try {
        const {
            user_id,
            user_name,
            group,
            expiry_date,
            user_status,
            face_data,
        } = req.body as any;
        console.log("BOADY : ", req.body);

        // Validate user data (add more validation as needed)
        if (!user_id || !user_name || !group || !expiry_date) {
            res.status(400).json({ error: "Missing required fields" });
        }

        const user_image = req.file; // Access the uploaded file buffer

        // Check if user_image is undefined
        if (!user_image) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Insert user into the database using Prisma
        const newUser = await prisma.user.create({
            data: {
                user_id,
                user_name,
                user_image: "/static/" + user_image.filename,
                group,
                expiry_date,
                created_at: new Date(),
                updated_at: new Date(),
                user_status: user_status || "Registration",
                face_data: face_data,
            },
        });

        res.status(200).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        // Insert user into the database using Prisma
        const users = await prisma.user.findMany();

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { user_id, user_name, group, expiry_date, face_data } =
            req.body as any;

        const userId: string = req.query.id as string;

        // Validate user data (add more validation as needed)
        if (!user_name || !group || !expiry_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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
            face_data,
        };

        const user_image = req.file; // Access the uploaded file buffer

        // Check if user_image is not undefined
        if (user_image) {
            updateObj.user_image = "/static/" + user_image.filename;
        }

        // Update user in the database using Prisma
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: updateObj,
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
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

        // Update user's status in the database using Prisma
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: { user_status: status },
        });

        // Return the updated user as a response
        res.status(200).json(updatedUser);
    } catch (error) {
        // Handle errors
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user status" });
    }
}

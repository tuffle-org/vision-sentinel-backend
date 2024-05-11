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
            user_image,
        } = req.body as any;
        console.log("BOADY : ", req.body, req.file?.buffer);

        // Validate user data (add more validation as needed)
        if (!user_id || !user_name || !group || !expiry_date) {
            res.status(400).json({ error: "Missing required fields" });
        }

        // Insert user into the database using Prisma
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
        const {
            user_id,
            user_name,
            user_image,
            group,
            expiry_date,
            user_status,
            face_data,
        } = req.body as any;

        const userId: string = req.query.id as string;

        // Validate user data (add more validation as needed)
        if (!user_id || !user_name || !group || !expiry_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: { user_id },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user in the database using Prisma
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                user_name,
                group,
                expiry_date,
                updated_at: new Date(),
                user_status: user_status || "Registration",
                face_data,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

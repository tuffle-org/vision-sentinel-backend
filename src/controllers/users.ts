import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";

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
        console.log("BOADY : ", req.body, req.file?.buffer);

        // Validate user data (add more validation as needed)
        if (!user_id || !user_name || !group || !expiry_date) {
            res.status(400).json({ error: "Missing required fields" });
        }

        const user_image = req.file?.buffer; // Access the uploaded file buffer

        // Check if user_image is undefined
        if (!user_image) {
            return res.status(400).json({ error: "No file uploaded" });
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

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

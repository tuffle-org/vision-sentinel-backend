// loginController.ts

import { Request, Response } from "express";
import { generateToken } from "../services/auth";
import { USERNAME } from "../config/constants";
import prisma from "../config/prisma";

export async function loginUser(req: Request, res: Response): Promise<void> {
    // Authenticate user (example: check credentials)
    const { username, password } = req.body;
    const passwordObj: any = await prisma.password.findFirst();

    if (!passwordObj) {
        if (username !== USERNAME || password !== 1234) {
            const token = generateToken(username);
            res.json({ token });
        }
    }

    if (username !== USERNAME || password !== passwordObj.password) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }

    // Generate JWT token
    const token = generateToken(username);

    res.json({ token });
}

export async function passwordChange(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { oldPassword, newPassword } = req.body;

        if (newPassword.length !== 4) {
            res.send(400).json({ error: "Password should be 4 digits only!" });
        }

        // Check if the old password matches the existing password
        const existingPassword = await prisma.password.findFirst();

        if (!existingPassword) {
            await prisma.password.create({
                data: { password: newPassword },
            });
            res.json({ message: "Password updated successfully" });
        } else {
            if (existingPassword.password !== oldPassword) {
                res.status(400).json({ error: "Invalid old password" });
            }

            // Update the first row in the Password model with the new password
            const updatedPassword = await prisma.password.updateMany({
                data: {
                    password: newPassword,
                },
            });
        }

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error in passwordChange:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// loginController.ts

import { Request, Response } from "express";
import { generateToken } from "../services/auth";
import { PASSWORD, USERNAME } from "../config/constants";

export function loginUser(req: Request, res: Response): void {
    // Authenticate user (example: check credentials)
    const { username, password } = req.body;
    if (username !== USERNAME || password !== PASSWORD) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }

    // Generate JWT token
    const token = generateToken(username);

    res.json({ token });
}

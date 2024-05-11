import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/constants";

// Middleware to verify JWT token
export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token exists
    if (!token) {
        return res
            .status(401)
            .json({ error: "Unauthorized: Token is missing" });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return null;
    }
}

// auth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET);
}

export function verifyToken(token: string): string | object | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
): void | Response<any, Record<string, any>> {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const decoded = verifyToken(token);
    if (!decoded) return res.sendStatus(403);

    (req as any).userId = (decoded as { userId: string }).userId;
    next();
}

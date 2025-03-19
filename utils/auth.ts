import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// From Exercise 6

const SECRET_KEY = process.env.JWT_SECRET as string;


export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

// Verify JWT Token (returns payload or null)
export function verifyToken(request: NextRequest): TokenPayload | null {
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.replace("Bearer ", "");

    try {
        return jwt.verify(token, SECRET_KEY) as TokenPayload;
    } catch {
        return null;
    }
}

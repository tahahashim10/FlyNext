import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

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

// Update verifyToken to be async so we can await cookies()
export async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      return payload as TokenPayload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

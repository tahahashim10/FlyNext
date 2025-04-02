import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password } = await request.json();

  try {
    // Validate input: check existence, type, and that they're not empty after trimming.
    if (
      !email || typeof email !== "string" || email.trim() === "" ||
      !password || typeof password !== "string" || password.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Missing or invalid email or password" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "1m" });
    const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    // Set tokens in HTTP-only cookies
    const accessCookie = serialize("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60, // 30 minutes
    });

    const refreshCookie = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const response = NextResponse.json({ 
      message: "Login successful", 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      } 
    });
    response.headers.set("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);
    return response;

  } catch (error: any) {
    console.error("Login error:", error.stack);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
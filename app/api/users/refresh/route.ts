import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, SECRET_KEY);
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Here you might want to check if the user still exists etc.

    const payload = { 
      userId: decoded.userId, 
      email: decoded.email, 
      role: decoded.role 
    };

    const newAccessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "30m" });
    const response = NextResponse.json({ message: "Token refreshed" });
    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60, // 30 minutes
    });
    return response;
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

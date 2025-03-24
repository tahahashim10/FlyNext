'use server';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/auth";

// GET: Retrieve the current user's profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      // Optionally, select specific fields if needed
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update the current user's profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized: No valid token provided." }, { status: 401 });
  }

  try {
    const { firstName, lastName, phoneNumber, profilePicture } = await request.json();

    // Helper: Validate URL format.
    function isValidUrl(string: string): boolean {
      const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
      return urlRegex.test(string);
    }

    // Validate inputs.
    if (firstName !== undefined && (typeof firstName !== "string" || firstName.trim() === "")) {
      return NextResponse.json({ error: "First name must be a non-empty string." }, { status: 400 });
    }
    if (lastName !== undefined && (typeof lastName !== "string" || lastName.trim() === "")) {
      return NextResponse.json({ error: "Last name must be a non-empty string." }, { status: 400 });
    }
    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
        return NextResponse.json({ error: "Phone number must be a non-empty string." }, { status: 400 });
      }
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        return NextResponse.json({ error: "Phone number must be valid (10 to 15 digits, optional '+' prefix)." }, { status: 400 });
      }
    }
    if (profilePicture !== undefined) {
      if (typeof profilePicture !== "string" || profilePicture.trim() === "" || !isValidUrl(profilePicture)) {
        return NextResponse.json({ error: "Profile picture must be a valid URL." }, { status: 400 });
      }
    }

    // Check if user exists.
    const existingUser = await prisma.user.findUnique({
      where: { id: tokenData.userId },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const dataClause: { [key: string]: any } = {};
    if (firstName !== undefined) dataClause.firstName = firstName;
    if (lastName !== undefined) dataClause.lastName = lastName;
    if (phoneNumber !== undefined) dataClause.phoneNumber = phoneNumber;
    if (profilePicture !== undefined) dataClause.profilePicture = profilePicture;

    const updatedUser = await prisma.user.update({
      where: { id: tokenData.userId },
      data: dataClause,
    });

    return NextResponse.json({ message: "Profile updated successfully", updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Edit profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

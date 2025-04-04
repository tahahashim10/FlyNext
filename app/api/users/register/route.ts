import prisma from "@/utils/db";
import { NextResponse, NextRequest } from "next/server";
import { hashPassword } from "@/utils/auth";

// Function to generate a beautiful initial avatar
function generateInitialAvatar(firstName: string): string {
  const initial = firstName.charAt(0).toUpperCase();
  
  // Generate a random, pleasing color palette
  const colors = [
    { bg: '#3B82F6', text: 'white' },    // Blue
    { bg: '#10B981', text: 'white' },    // Green
    { bg: '#6366F1', text: 'white' },    // Indigo
    { bg: '#8B5CF6', text: 'white' },    // Purple
    { bg: '#EC4899', text: 'white' },    // Pink
    { bg: '#F59E0B', text: 'white' },    // Amber
  ];

  // Select a random color scheme
  const { bg, text } = colors[Math.floor(Math.random() * colors.length)];

  // Create an SVG with the initial
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250" fill="${bg}">
      <rect width="250" height="250" fill="${bg}"/>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dy=".35em" 
        fill="${text}" 
        font-family="Arial, sans-serif" 
        font-size="120" 
        font-weight="400"
      >
        ${initial}
      </text>
    </svg>
  `;

  // Convert SVG to base64
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { firstName, lastName, email, password, phoneNumber, profilePicture, role } = await request.json();

        // Validate required fields and types
        if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
            return NextResponse.json({ error: "First name is required and must be a non-empty string" }, { status: 400 });
        }
        if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
            return NextResponse.json({ error: "Last name is required and must be a non-empty string" }, { status: 400 });
        }
        if (!email || typeof email !== "string" || email.trim() === "") {
            return NextResponse.json({ error: "Email is required and must be a non-empty string" }, { status: 400 });
        }
        if (!password || typeof password !== "string" || password.trim() === "") {
            return NextResponse.json({ error: "Password is required and must be a non-empty string" }, { status: 400 });
        }
        
        // validate email format with a regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json({ error: `User with email ${email} already exists` }, { status: 400 });
        }

        if (phoneNumber !== undefined && phoneNumber !== null) {
            if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
                return NextResponse.json({ error: "phoneNumber must be a non-empty string." }, { status: 400 });
            }

            const phoneRegex = /^\+?\d{10,15}$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                return NextResponse.json({ error: "phoneNumber must be a valid phone number (10 to 15 digits, optional '+' prefix)." }, { status: 400 });
            }
        }
          
        // If no profile picture is provided, generate a default one
        const finalProfilePicture = profilePicture ? profilePicture : generateInitialAvatar(firstName);

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create the user
        const createdUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phoneNumber,
                profilePicture: finalProfilePicture,
                role: role || "USER", 
            },
        });

        // Return the created user (excluding the password)
        return NextResponse.json(
            {
                user: {
                    id: createdUser.id,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    email: createdUser.email,
                    phoneNumber: createdUser.phoneNumber,
                    profilePicture: createdUser.profilePicture,
                    role: createdUser.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error.stack);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// source: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isValidUrl(string: string): boolean {
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(string);
}
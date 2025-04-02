import { NextResponse, NextRequest } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  // Clear the authentication token cookie
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Clear the cookie immediately
  });

  // Just return a success response, don't try to redirect
  const response = NextResponse.json({ success: true });
  
  // Set the cookie to clear the token
  response.headers.set('Set-Cookie', cookie);
  
  return response;
}
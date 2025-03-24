// app/api/users/logout/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Clear the cookie immediately
  });
  const response = NextResponse.json({ message: 'Logout successful' });
  response.headers.set('Set-Cookie', cookie);
  return response;
}

import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);
  if (tokenData instanceof NextResponse || !tokenData) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({ loggedIn: true });
}

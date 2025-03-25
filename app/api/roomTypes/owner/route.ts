import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Query for all rooms where the associated hotel is owned by the current user.
    const rooms = await prisma.room.findMany({
      where: {
        hotel: { ownerId: tokenData.userId },
      },
      select: { name: true },
    });
    // Get distinct room names.
    const roomNames = Array.from(new Set(rooms.map(room => room.name)));
    return NextResponse.json(roomNames, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching room types for owner:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

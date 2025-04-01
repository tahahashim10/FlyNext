import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const hotelIdParam = searchParams.get('hotelId');
    if (!hotelIdParam || isNaN(Number(hotelIdParam))) {
      return NextResponse.json({ error: "Valid hotelId is required" }, { status: 400 });
    }
    const hotelId = Number(hotelIdParam);
    
    // (Optional) Verify that the hotel belongs to the current user:
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== tokenData.userId) {
      return NextResponse.json({ error: "Hotel not found or you do not own this hotel" }, { status: 404 });
    }
    
    const roomTypes = await prisma.room.findMany({
      where: { hotelId },
    });
    return NextResponse.json(roomTypes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

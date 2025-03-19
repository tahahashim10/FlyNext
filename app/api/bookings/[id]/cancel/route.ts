import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/auth';

interface CancelParams {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: CancelParams }
): Promise<NextResponse> {
  const tokenData = verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: "Valid booking ID is required in the path" }, { status: 400 });
  }
  try {

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { hotel: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.hotel || booking.hotel.ownerId !== tokenData.userId) {
      return NextResponse.json({ error: "Forbidden: This booking does not belong to your hotel" }, { status: 403 });
    }

    if (booking.status === "CANCELED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELED' },
    });

    await prisma.notification.create({
      data: {
        userId: updatedBooking.userId,
        message: `Your booking at ${booking.hotel.name} has been canceled by the hotel owner. Please contact the hotel for further assistance.`,
      },
    });
    
    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

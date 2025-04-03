import { NextRequest, NextResponse } from "next/server";
import prisma from '@/utils/db';
import { getUserBookings } from "@/utils/bookings";
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const hotelBookings = await getUserBookings(tokenData.userId);
    const flightBookings = await prisma.flightBooking.findMany({
      where: { userId: tokenData.userId },
    });
    return NextResponse.json({ hotelBookings, flightBookings }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH endpoint for user cancellation (U20)
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();

    // Only support single cancellation for user-initiated cancellation.
    if (!(body.bookingId && body.bookingType)) {
      return NextResponse.json({ error: "For cancellation, provide both bookingId and bookingType." }, { status: 400 });
    }
    
    const bookingId = Number(body.bookingId);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "bookingId must be a number." }, { status: 400 });
    }
    const bookingType = body.bookingType;
    if (!["hotel", "flight"].includes(bookingType)) {
      return NextResponse.json({ error: "bookingType must be either 'hotel' or 'flight'." }, { status: 400 });
    }
    
    let booking: any = null;
    if (bookingType === "hotel") {
      booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    } else {
      booking = await prisma.flightBooking.findUnique({ where: { id: bookingId } });
    }
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    // Verify the booking belongs to the user
    if (booking.userId !== tokenData.userId) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to cancel this booking." }, { status: 403 });
    }
    if (booking.status === "CANCELED") {
      return NextResponse.json({ message: "Booking is already cancelled.", booking }, { status: 200 });
    }
    
    if (bookingType === "hotel") {
      booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELED" },
      });
    } else {
      // For flight bookings: Only call AFS if a bookingReference exists.
      if (booking.flightBookingReference) {
        try {
          await callAfsCancelBooking(booking);
        } catch (error: any) {
          return NextResponse.json({ error: "Failed to cancel flight booking via AFS: " + error.message }, { status: 400 });
        }
      }
      booking = await prisma.flightBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELED" },
      });
    }
    await prisma.notification.create({
      data: {
        userId: tokenData.userId,
        message: "Your booking has been canceled successfully.",
      },
    });
    return NextResponse.json({ message: "Booking cancelled", booking }, { status: 200 });
  } catch (error: any) {
    console.error("Cancel Bookings Error:", error.stack);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Helper function for calling AFS cancellation API (for flight bookings)
async function callAfsCancelBooking(booking: { flightBookingReference: string | null; lastName: string; }): Promise<any> {
  const baseUrl = process.env.AFS_BASE_URL as string;
  const apiKey = process.env.AFS_API_KEY as string;
  if (!baseUrl || !apiKey) {
    throw new Error("AFS API configuration is missing.");
  }
  const url = new URL("/api/bookings/cancel", baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      bookingReference: booking.flightBookingReference,
      lastName: booking.lastName,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AFS cancellation API error: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// POST endpoint for creating bookings (U15)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const {
      hotelId,    // for hotel booking
      roomId,     // for hotel booking
      checkIn,    // for hotel booking
      checkOut,   // for hotel booking
      status,     // optional
      flightIds,  // for flight booking
      firstName,
      lastName,
      email,
      passportNumber
    } = await request.json();
    
    const userId: number = tokenData.userId;
    
    // Validate hotel booking inputs if provided.
    if ((hotelId !== undefined || roomId !== undefined) && (hotelId === undefined || roomId === undefined)) {
      return NextResponse.json({ error: "Both hotelId and roomId must be provided for a hotel reservation." }, { status: 400 });
    }
    if (hotelId !== undefined && typeof hotelId !== "number") {
      return NextResponse.json({ error: "hotelId must be a number." }, { status: 400 });
    }
    if (roomId !== undefined && typeof roomId !== "number") {
      return NextResponse.json({ error: "roomId must be a number." }, { status: 400 });
    }
    if ((checkIn || checkOut) && (!checkIn || !checkOut)) {
      return NextResponse.json({ error: "Both checkIn and checkOut dates must be provided." }, { status: 400 });
    }
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format for checkIn or checkOut. Use YYYY-MM-DD." }, { status: 400 });
      }
      if (checkInDate >= checkOutDate) {
        return NextResponse.json({ error: "checkIn must be before checkOut." }, { status: 400 });
      }
    }
    
    // Validate flight booking inputs if flightIds provided.
    if (flightIds !== undefined) {
      if (!Array.isArray(flightIds)) {
        return NextResponse.json({ error: "flightIds must be an array." }, { status: 400 });
      }
      
      // Removed the single flight validation - now allowing multiple flights
      
      if (flightIds.length > 0) {
        if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
          return NextResponse.json({ error: "firstName is required and must be a non-empty string for flight booking." }, { status: 400 });
        }
        if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
          return NextResponse.json({ error: "lastName is required and must be a non-empty string for flight booking." }, { status: 400 });
        }
        if (!email || typeof email !== "string" || email.trim() === "") {
          return NextResponse.json({ error: "email is required and must be a non-empty string for flight booking." }, { status: 400 });
        }
        if (!passportNumber || typeof passportNumber !== "string" || passportNumber.trim() === "") {
          return NextResponse.json({ error: "passportNumber is required and must be a non-empty string for flight booking." }, { status: 400 });
        }
        if (passportNumber.trim().length !== 9) {
          return NextResponse.json({ error: "passportNumber must be exactly 9 characters long." }, { status: 400 });
        }
      }
    }
    
    // Determine which booking types are requested.
    const isHotelBookingRequested = hotelId && roomId;
    const isFlightBookingRequested = flightIds && Array.isArray(flightIds) && flightIds.length > 0;
    if (!isHotelBookingRequested && !isFlightBookingRequested) {
      return NextResponse.json({ error: "At least one booking type (hotel or flight) must be provided." }, { status: 400 });
    }
    
    let hotelBooking = null;
    if (isHotelBookingRequested) {
      const hotelRecord = await prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotelRecord) {
        return NextResponse.json({ error: `Hotel with id ${hotelId} does not exist.` }, { status: 400 });
      }
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json({ error: `Room with id ${roomId} does not exist.` }, { status: 400 });
      }
      if (room.hotelId !== hotelId) {
        return NextResponse.json({ error: `Room with id ${roomId} does not belong to hotel with id ${hotelId}.` }, { status: 400 });
      }
      if (checkIn && checkOut) {
        const overlappingBookings = await prisma.booking.findMany({
          where: {
            roomId: roomId,
            status: { not: "CANCELED" },
            checkIn: { lt: new Date(checkOut) },
            checkOut: { gt: new Date(checkIn) },
          },
        });
        if (overlappingBookings.length >= room.availableRooms) {
          return NextResponse.json({ error: "No available rooms for the selected date range." }, { status: 400 });
        }
      }
      hotelBooking = await prisma.booking.create({
        data: {
          userId,
          hotelId,
          roomId,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          status: status || "PENDING",
        },
      });
      await prisma.notification.create({
        data: {
          userId,
          message: `Your reservation at ${hotelRecord.name} (Room: ${room.name}) has been successfully created. Check-in: ${checkIn || "N/A"}, Check-out: ${checkOut || "N/A"}.`,
        },
      });
      await prisma.notification.create({
        data: {
          userId: hotelRecord.ownerId,
          message: `A new booking has been made at your hotel ${hotelRecord.name}.`,
        },
      });
    }
    
    let flightBookings = [];
    if (isFlightBookingRequested) {
      const baseUrl = process.env.AFS_BASE_URL as string;
      const apiKey = process.env.AFS_API_KEY as string;
      if (!baseUrl || !apiKey) {
        return NextResponse.json({ error: "AFS API configuration is missing" }, { status: 500 });
      }
      
      // Create a separate booking for each flight
      for (const flightId of flightIds) {
        // Fetch flight details from AFS
        const url = new URL(`/api/flights/${flightId}`, baseUrl);
        const res = await fetch(url.toString(), {
          headers: { "x-api-key": apiKey },
        });
        const flightData = await res.json();
        if (!res.ok || !flightData) {
          return NextResponse.json({ error: `Flight ${flightId} not found.` }, { status: 400 });
        }
        if (flightData.status !== "SCHEDULED") {
          return NextResponse.json({ error: `Flight ${flightId} is not scheduled.` }, { status: 400 });
        }
        
        // Create individual flight booking
        const singleFlightBooking = await prisma.flightBooking.create({
          data: {
            userId,
            flightIds: [flightId], // Single flight ID per booking
            firstName,
            lastName,
            email,
            passportNumber,
            status: status || "PENDING",
            cost: flightData.price, // Cost for this specific flight
          },
        });
        
        flightBookings.push(singleFlightBooking);
      }
      
      // Send a notification for the flight bookings
      if (flightBookings.length > 0) {
        const flightCount = flightBookings.length;
        await prisma.notification.create({
          data: {
            userId,
            message: `${flightCount} flight ${flightCount > 1 ? 'reservations have' : 'reservation has'} been added to your cart. Complete the payment process to secure your booking.`,
          },
        });
      }
    }
    
    return NextResponse.json({ 
      hotelBooking, 
      flightBooking: flightBookings.length === 1 ? flightBookings[0] : null,
      flightBookings: flightBookings.length > 1 ? flightBookings : null
    }, { status: 201 });
  } catch (error: any) {
    console.error("Booking Error:", error.stack);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
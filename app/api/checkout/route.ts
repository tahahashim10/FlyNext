import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { isValidCardNumber, isValidExpiry } from '@/utils/validation';
import { verifyToken } from '@/utils/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tokenData = verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Individual field validations with detailed messages.
    if (payload.bookingId === undefined) {
      return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
    }
    if (payload.bookingType === undefined) {
      return NextResponse.json({ error: "bookingType is required and must be either 'hotel' or 'flight'." }, { status: 400 });
    }
    if (!payload.cardNumber || typeof payload.cardNumber !== "string" || payload.cardNumber.trim() === "") {
      return NextResponse.json({ error: "cardNumber is required and must be a non-empty string." }, { status: 400 });
    }
    if (payload.expiryMonth === undefined) {
      return NextResponse.json({ error: "expiryMonth is required." }, { status: 400 });
    }
    if (payload.expiryYear === undefined) {
      return NextResponse.json({ error: "expiryYear is required." }, { status: 400 });
    }

    // Validate bookingType value.
    const bookingType: string = payload.bookingType;
    if (!["hotel", "flight"].includes(bookingType)) {
      return NextResponse.json({ error: "bookingType must be either 'hotel' or 'flight'." }, { status: 400 });
    }

    // Validate bookingId is a number.
    const parsedBookingId: number = Number(payload.bookingId);
    if (isNaN(parsedBookingId)) {
      return NextResponse.json({ error: "bookingId must be a number." }, { status: 400 });
    }

    // Validate expiryMonth.
    if (typeof payload.expiryMonth !== "number" || payload.expiryMonth < 1 || payload.expiryMonth > 12) {
      return NextResponse.json({ error: "expiryMonth must be a number between 1 and 12." }, { status: 400 });
    }
    // Validate expiryYear.
    if (typeof payload.expiryYear !== "number") {
      return NextResponse.json({ error: "expiryYear must be a number." }, { status: 400 });
    }
    if (!isValidExpiry(payload.expiryMonth, payload.expiryYear)) {
      return NextResponse.json({ error: "The card is expired." }, { status: 400 });
    }
    // Validate card number using Luhn algorithm.
    if (!isValidCardNumber(payload.cardNumber)) {
      return NextResponse.json({ error: "Invalid credit card number." }, { status: 400 });
    }

    let booking: any = null;
    if (bookingType === "hotel") {
      booking = await prisma.booking.findUnique({
        where: { id: parsedBookingId },
        include: { user: true, hotel: true, room: true },
      });
    } else if (bookingType === "flight") {
      booking = await prisma.flightBooking.findUnique({
        where: { id: parsedBookingId },
        include: { user: true },
      });
    }
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.userId !== tokenData.userId) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to checkout this booking." }, { status: 403 });
    }
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ error: "Booking is already confirmed." }, { status: 400 });
    }
    // **Add check to ensure the booking is pending**
    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be checked out." }, { status: 400 });
    }

    // Mark the booking as confirmed in the appropriate table.
    if (bookingType === "hotel") {
      booking = await prisma.booking.update({
        where: { id: parsedBookingId },
        data: { status: "CONFIRMED" },
      });
    } else {
      // For flight bookings, call AFS booking API at checkout.
      let afsResponse: any;
      try {
        afsResponse = await callAfsBooking({
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          passportNumber: booking.passportNumber,
          flightIds: booking.flightIds,
        });
      } catch (error: any) {
        return NextResponse.json({ error: "AFS booking failed: " + error.message }, { status: 400 });
      }

      booking = await prisma.flightBooking.update({
        where: { id: parsedBookingId },
        data: {
          status: "CONFIRMED",
          flightBookingReference: afsResponse.bookingReference,
        },
      });
    }

    // Create a notification.
    const bookingDisplayName = bookingType === "hotel" 
      ? (booking.hotel ? booking.hotel.name : "your hotel") 
      : "your flight booking";
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        message: `Congratulations! Your ${bookingType === "hotel" ? (booking.hotel ? booking.hotel.name : "hotel reservation") : "flight reservation"} has been confirmed. Please check your itinerary for full details.`,
      },
    });

    return NextResponse.json({ message: "Booking confirmed", booking }, { status: 200 });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

async function callAfsBooking(payload: {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  flightIds: any;
}): Promise<any> {
  const baseUrl = process.env.AFS_BASE_URL as string;
  const apiKey = process.env.AFS_API_KEY as string;
  if (!baseUrl || !apiKey) {
    throw new Error("AFS API configuration is missing");
  }
  const url = new URL("/api/bookings", baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AFS booking API error: ${res.status} - ${errorText}`);
  }
  return res.json();
}
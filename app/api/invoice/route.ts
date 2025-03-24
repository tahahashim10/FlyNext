import { NextRequest, NextResponse } from "next/server";
import { getBookingDetails } from "@/utils/invoice";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { verifyToken } from "@/utils/auth";
import { FlightBooking } from "@prisma/client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify token
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { bookingId, bookingType } = await request.json();
    if (!bookingId || isNaN(Number(bookingId))) {
      return NextResponse.json({ error: "bookingId must be a number." }, { status: 400 });
    }
    if (!bookingType || !["hotel", "flight"].includes(bookingType)) {
      return NextResponse.json(
        { error: "bookingType is required and must be either 'hotel' or 'flight'." },
        { status: 400 }
      );
    }

    let booking = await getBookingDetails(Number(bookingId), bookingType);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.userId !== tokenData.userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to access this booking." },
        { status: 403 }
      );
    }

    // Make sure the booking is confirmed (payed and finalized) before generating an invoice.
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Invoice can only be generated for confirmed/payed bookings." },
        { status: 400 }
      );
    }

    // For flight bookings, fetch additional details from the AFS API.
    // For flight bookings, fetch additional details from the AFS API.
    if (bookingType === "flight") {
      // Narrow booking to FlightBooking with required user property.
      const flightBooking = booking as (import("@prisma/client").FlightBooking & {
        user: { firstName: string; lastName: string; email: string };
      });
      if (flightBooking.flightBookingReference) {
        const baseUrl = process.env.AFS_BASE_URL as string;
        const apiKey = process.env.AFS_API_KEY as string;
        if (!baseUrl || !apiKey) {
          return NextResponse.json({ error: "AFS API configuration is missing." }, { status: 500 });
        }
        const url = new URL("/api/bookings/retrieve", baseUrl);
        // Use the user's lastName from the flight booking's user object.
        url.search = new URLSearchParams({
          lastName: flightBooking.user.lastName,
          bookingReference: flightBooking.flightBookingReference
        }).toString();
        
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey },
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          return NextResponse.json({ error: `AFS API error: ${res.status} - ${errorText}` }, { status: res.status });
        }
        
        const flightDetails = await res.json();
        // Merge flightDetails into the booking object.
        booking = { ...flightBooking, flightDetails } as import("@prisma/client").FlightBooking & {
          flightDetails: any;
          user: { firstName: string; lastName: string; email: string };
        };
      }
    }


    const pdfBuffer = await generateInvoicePDF(booking!);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice_${booking!.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Invoice Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

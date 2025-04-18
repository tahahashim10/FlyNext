import { NextRequest, NextResponse } from "next/server";
import { getBookingDetails } from "@/utils/invoice";
import { generateConsolidatedInvoicePDF } from "@/utils/pdfGenerator";
import { verifyToken } from "@/utils/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Expect payload: { bookings: [{ bookingId: number, bookingType: "hotel" | "flight" }, ...] }
    const { bookings: bookingRequests } = await request.json();
    if (!bookingRequests || !Array.isArray(bookingRequests) || bookingRequests.length === 0) {
      return NextResponse.json({ error: "bookings must be a non-empty array." }, { status: 400 });
    }
    
    const aggregatedHotelBookings: any[] = [];
    const aggregatedFlightBookings: any[] = [];
    let totalCost = 0;
    
    for (const reqItem of bookingRequests) {
      const { bookingId, bookingType } = reqItem;
      if (!bookingId || isNaN(Number(bookingId))) {
        return NextResponse.json({ error: "Each booking must have a valid bookingId." }, { status: 400 });
      }
      if (!bookingType || !["hotel", "flight"].includes(bookingType)) {
        return NextResponse.json({ error: "Each booking must have a bookingType of either 'hotel' or 'flight'." }, { status: 400 });
      }
      
      let booking = await getBookingDetails(Number(bookingId), bookingType);
      if (!booking) {
        return NextResponse.json({ error: `Booking ${bookingId} not found.` }, { status: 404 });
      }
      if (booking.userId !== tokenData.userId) {
        return NextResponse.json({ error: "Forbidden: You are not authorized to access one or more bookings." }, { status: 403 });
      }
      if (booking.status !== "CONFIRMED") {
        return NextResponse.json({ error: "Invoice can only be generated for confirmed bookings." }, { status: 400 });
      }
      
      if (bookingType === "hotel") {
        // Compute cost: room.pricePerNight * number of nights.
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const cost = booking.room.pricePerNight * nights;
        booking.totalCost = cost;
        totalCost += cost;
        aggregatedHotelBookings.push(booking);
      } else if (bookingType === "flight") {
        // For flight bookings, assume cost is stored in booking.cost.
        if (booking.cost) {
          totalCost += booking.cost;
        }
        aggregatedFlightBookings.push(booking);
      }
    }
    
    const consolidatedData = {
      hotelBookings: aggregatedHotelBookings,
      flightBookings: aggregatedFlightBookings,
      totalCost,
    };
    
    const pdfBuffer = await generateConsolidatedInvoicePDF(consolidatedData);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice_consolidated.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Invoice Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

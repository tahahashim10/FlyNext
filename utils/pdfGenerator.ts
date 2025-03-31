import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface ConsolidatedInvoiceData {
  hotelBookings: any[];
  flightBookings: any[];
  totalCost: number;
}

export async function generateConsolidatedInvoicePDF(data: ConsolidatedInvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  
  let invoiceText = "Consolidated Invoice\n\n";
  invoiceText += `Invoice generated on: ${new Date().toLocaleString()}\n\n`;

  if (data.hotelBookings.length > 0) {
    invoiceText += "Hotel Bookings:\n";
    data.hotelBookings.forEach((booking, idx) => {
      invoiceText += `\nBooking ID: ${booking.id}\n`;
      invoiceText += `Hotel: ${booking.hotel.name}\n`;
      invoiceText += `Location: ${booking.hotel.location}\n`;
      invoiceText += `Room: ${booking.room.name}\n`;
      invoiceText += `Check-In: ${new Date(booking.checkIn).toLocaleDateString()}\n`;
      invoiceText += `Check-Out: ${new Date(booking.checkOut).toLocaleDateString()}\n`;
      invoiceText += `Cost: $${booking.totalCost?.toFixed(2) || 'N/A'}\n`;
    });
    invoiceText += "\n";
  }
  
  if (data.flightBookings.length > 0) {
    invoiceText += "Flight Bookings:\n";
    data.flightBookings.forEach((booking, idx) => {
      invoiceText += `\nBooking ID: ${booking.id}\n`;
      // Display flight IDs instead of flight reference
      invoiceText += `Flight IDs: ${Array.isArray(booking.flightIds) ? booking.flightIds.join(", ") : booking.flightIds}\n`;
      invoiceText += `Cost: $${booking.cost ? booking.cost.toFixed(2) : 'N/A'}\n`;
      if (booking.flightDetails && Array.isArray(booking.flightDetails.flights)) {
        booking.flightDetails.flights.forEach((flight: any, index: number) => {
          invoiceText += `\n--- Flight ${index + 1} Details ---\n`;
          if (flight.airline) {
            invoiceText += `Airline: ${flight.airline.name} (${flight.airline.code})\n`;
          }
          if (flight.origin) {
            invoiceText += `Origin: ${flight.origin.name}, ${flight.origin.city}\n`;
          }
          if (flight.destination) {
            invoiceText += `Destination: ${flight.destination.name}, ${flight.destination.city}\n`;
          }
          if (flight.departureTime) {
            invoiceText += `Departure: ${new Date(flight.departureTime).toLocaleString()}\n`;
          }
          if (flight.arrivalTime) {
            invoiceText += `Arrival: ${new Date(flight.arrivalTime).toLocaleString()}\n`;
          }
          if (flight.price !== undefined) {
            invoiceText += `Price: $${flight.price.toFixed(2)}\n`;
          }
        });
      }
    });
    invoiceText += "\n";
  }
  
  invoiceText += `Total Cost: $${data.totalCost.toFixed(2)}\n\n`;
  invoiceText += "Thank you for booking with us!";
  
  page.drawText(invoiceText, {
    x: 50,
    y: height - 50 - fontSize * 1.5,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
    lineHeight: fontSize * 1.5,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateInvoicePDF(booking: any): Promise<Buffer> {
  // Create a new PDF document.
  const pdfDoc = await PDFDocument.create();
  // Embed a standard font (Times Roman).
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  // Add a blank page to the document.
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;

  // Build the invoice text content.
  let invoiceText = "Trip Invoice\n\n";
  invoiceText += `Invoice ID: ${booking.id}\n`;
  invoiceText += `Booking Date: ${new Date(booking.createdAt).toDateString()}\n`;
  invoiceText += `Status: ${booking.status}\n\n`;

  // Include hotel details if available.
  if (booking.hotel) {
    invoiceText += "Hotel Details:\n";
    invoiceText += `Hotel: ${booking.hotel.name}\n`;
    invoiceText += `Location: ${booking.hotel.location}\n`;
    invoiceText += `Check-in: ${booking.checkIn ? new Date(booking.checkIn).toDateString() : "N/A"}\n`;
    invoiceText += `Check-out: ${booking.checkOut ? new Date(booking.checkOut).toDateString() : "N/A"}\n`;
    if (booking.room) {
      invoiceText += `Room: ${booking.room.name}\n`;
      invoiceText += `Price per Night: $${booking.room.pricePerNight}\n`;

      // Calculate total price if checkIn and checkOut are provided.
      if (booking.checkIn && booking.checkOut) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        // Calculate the number of nights.
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
        const totalPrice = days * booking.room.pricePerNight;
        invoiceText += `Total Price: $${totalPrice}\n`;
      }
    }
    invoiceText += "\n";
  }
  
  // Include flight booking details if available.
  if (booking.flightBookingReference) {
    invoiceText += "Flight Booking:\n";
    invoiceText += `Booking Reference: ${booking.flightBookingReference}\n`;
    // If additional flight details were fetched, print each flight's details.
    if (booking.flightDetails && Array.isArray(booking.flightDetails.flights)) {
      booking.flightDetails.flights.forEach((flight: any, index: number) => {
        invoiceText += `\n--- Flight ${index + 1} ---\n`;
        if (flight.airline) {
          invoiceText += `Airline: ${flight.airline.name} (${flight.airline.code})\n`;
        }
        if (flight.origin) {
          invoiceText += `Origin: ${flight.origin.name}, ${flight.origin.city}\n`;
        }
        if (flight.destination) {
          invoiceText += `Destination: ${flight.destination.name}, ${flight.destination.city}\n`;
        }
        if (flight.departureTime) {
          invoiceText += `Departure: ${new Date(flight.departureTime).toLocaleString()}\n`;
        }
        if (flight.arrivalTime) {
          invoiceText += `Arrival: ${new Date(flight.arrivalTime).toLocaleString()}\n`;
        }
        if (flight.price !== undefined) {
          invoiceText += `Price: $${flight.price}\n`;
        }
      });
      invoiceText += "\n";
    } else {
      // If no additional details, fallback to printing flight IDs.
      if (booking.flightIds) {
        invoiceText += `Flight IDs: ${JSON.stringify(booking.flightIds)}\n\n`;
      }
    }
  }

  invoiceText += "Thank you for booking with us!";

  // Draw the text on the page.
  page.drawText(invoiceText, {
    x: 50,
    y: height - 50 - fontSize * 1.5,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
    lineHeight: fontSize * 1.5,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

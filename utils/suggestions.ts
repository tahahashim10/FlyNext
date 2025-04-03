import prisma from "@/utils/db";

export async function getSuggestedHotels(city: string): Promise<any[]> {
  return await prisma.hotel.findMany({
    where: { location: city },
    select: {
      id: true,
      name: true,
      starRating: true,
      address: true,
      images: true,
    },
    take: 5,
  });
}

// Accepts an optional suggestedDate parameter.
export async function getSuggestedFlights(
  destinationCity: string,
  departureCity: string = "Toronto",
  suggestedDate?: string
): Promise<any[]> { // * note: default departureCity is Toronto
  console.log(`Fetching flights from ${departureCity} to ${destinationCity} for date: ${suggestedDate || 'using default'}`);
  
  const baseUrl = process.env.AFS_BASE_URL as string;
  const apiKey = process.env.AFS_API_KEY as string;
  if (!baseUrl || !apiKey) {
    throw new Error("AFS API configuration is missing");
  }
  
  // Use the provided suggestedDate, or default to tomorrow's date.
  let date = suggestedDate;
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split("T")[0];
  }
  
  const url = new URL("/api/flights", baseUrl);
  url.search = new URLSearchParams({
    origin: departureCity,
    destination: destinationCity,
    date: date,
  }).toString();

  try {
    console.log(`Calling AFS API: ${url.toString()}`);
    
    const res = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey },
    });
    
    if (!res.ok) {
      console.error(`AFS flight search error: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    console.log(`AFS API response received with ${data.results?.length || 0} result groups`);
    
    // Process the flight data to return proper connection information
    if (data.flightThere && data.flightThere.results) {
      // If the API already returns grouped legs, use that format
      return data.flightThere.results.slice(0, 5).map((item: any) => ({
        id: item.flights.map((f: any) => f.id).join(','),
        legs: item.legs,
        flights: item.flights,
        layover: item.layover,
        totalDuration: item.flights.reduce((acc: number, flight: any) => acc + flight.duration, 0),
        totalPrice: item.flights.reduce((acc: number, flight: any) => acc + flight.price, 0),
        departureTime: item.flights[0].departureTime,
        arrivalTime: item.flights[item.flights.length - 1].arrivalTime,
        mainAirline: item.flights[0].airline
      }));
    } else if (data.results && Array.isArray(data.results)) {
      // If the API returns groups of flights, process them
      const processedResults = [];
      
      for (const group of data.results) {
        if (group.flights && Array.isArray(group.flights)) {
          // Each group is a potential connection
          processedResults.push({
            id: group.flights.map((f: any) => f.id).join(','),
            legs: group.flights.length,
            flights: group.flights,
            layover: group.layover || 0,
            totalDuration: group.flights.reduce((acc: number, flight: any) => acc + (flight.duration || 0), 0),
            totalPrice: group.flights.reduce((acc: number, flight: any) => acc + flight.price, 0),
            departureTime: group.flights[0].departureTime,
            arrivalTime: group.flights[group.flights.length - 1].arrivalTime,
            mainAirline: group.flights[0].airline
          });
        }
      }
      
      return processedResults.slice(0, 5);
    } else {
      // Fallback: if the API returns just a flat list of flights, try to group them
      let flights: any[] = [];
      if (data.flights && Array.isArray(data.flights)) {
        flights = data.flights;
      } else if (data.results && Array.isArray(data.results)) {
        flights = data.results.flatMap((group: any) => group.flights || []);
      }
      
      // Remove duplicates by ID
      const uniqueFlights = Array.from(new Map(flights.map((flight: any) => [flight.id, flight])).values());
      
      // Sort flights by departure time
      uniqueFlights.sort((a: any, b: any) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
      
      // Return the flights with added origin/destination info
      return uniqueFlights.slice(0, 5).map((flight: any) => ({
        id: flight.id,
        legs: 1, // Assume single leg if no connection info
        flights: [flight],
        totalPrice: flight.price,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        mainAirline: flight.airline,
        origin: departureCity,
        destination: destinationCity
      }));
    }
  } catch (error) {
    console.error("Error in getSuggestedFlights:", error);
    return [];
  }
}
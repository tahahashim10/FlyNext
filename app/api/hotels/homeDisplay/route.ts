import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Fetch hotels ordered by star rating (highest first)
        const allHotels = await prisma.hotel.findMany({
            orderBy: {
                starRating: "desc"
            },
            include: {
                rooms: {
                    orderBy: {
                        pricePerNight: "asc"
                    },
                    take: 1, // Just take the cheapest room for pricing info
                }
            },
            take: 50 // Fetch more than needed to ensure variety after filtering
        });

        // Process hotels to get starting prices and filter by location
        const processedHotels = allHotels.map(hotel => {
            const startingPrice = hotel.rooms.length > 0 ? hotel.rooms[0].pricePerNight : null;
            
            return {
                id: hotel.id,
                name: hotel.name,
                logo: hotel.logo,
                address: hotel.address,
                location: hotel.location,
                starRating: hotel.starRating,
                startingPrice,
                images: hotel.images || [], // Include the images array
                coordinates: { lat: null, lng: null } // Not needed for homepage display
            };
        });

        // Group by location to ensure variety
        const locationMap = new Map();
        processedHotels.forEach(hotel => {
            // Use just the city part of the location for grouping
            const city = hotel.location.split(',')[0].trim();
            
            // Only keep the highest rated hotel for each city
            if (!locationMap.has(city) || locationMap.get(city).starRating < hotel.starRating) {
                locationMap.set(city, hotel);
            }
        });

        // Convert map back to array and take top 4
        const topHotels = Array.from(locationMap.values()).slice(0, 4);
        
        return NextResponse.json({ results: topHotels }, { status: 200 });
    } catch (error: any) {
        console.error("Error retrieving top hotels:", error.stack);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getSearchParams } from "@/utils/query";
import { geocodeAddress } from "@/utils/geocode";
import { verifyToken } from "@/utils/auth";

// Function to generate a sophisticated hotel logo
function generateHotelLogo(name: string): string {
  // Extract the first one or two letters, preferring words with more meaning
  const words = name.split(/\s+/);
  const initial = words.length > 1 
    ? words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
    : name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1) : '');

  // Sophisticated color palette with gradient
  const gradients = [
    { 
      start: '#667eea', 
      end: '#764ba2', 
      text: 'white',
      shadow: 'rgba(102, 126, 234, 0.3)'
    },
    { 
      start: '#00b4db', 
      end: '#0083b0', 
      text: 'white',
      shadow: 'rgba(0, 180, 219, 0.3)'
    },
    { 
      start: '#ff6a00', 
      end: '#ee0979', 
      text: 'white',
      shadow: 'rgba(255, 106, 0, 0.3)'
    },
    { 
      start: '#42e695', 
      end: '#3bb2b8', 
      text: 'white',
      shadow: 'rgba(66, 230, 149, 0.3)'
    }
  ];

  // Select a random gradient
  const { start, end, text, shadow } = gradients[Math.floor(Math.random() * gradients.length)];

  // Create an advanced SVG logo with modern design elements
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <!-- Gradient Background -->
      <defs>
        <linearGradient id="hotelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        
        <!-- Subtle Shadow Filter -->
        <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
          <feOffset dx="0" dy="10" result="offsetblur"/>
          <feFlood flood-color="${shadow}"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background Rectangle with Gradient and Soft Corners -->
      <rect 
        width="500" 
        height="500" 
        rx="50" 
        ry="50" 
        fill="url(#hotelGradient)"
        filter="url(#shadowFilter)"
      />

      <!-- Stylized Text -->
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dy=".35em" 
        fill="${text}" 
        font-family="'Helvetica Neue', Arial, sans-serif" 
        font-size="250" 
        font-weight="700"
        letter-spacing="-15"
        filter="url(#shadowFilter)"
      >
        ${initial}
      </text>
    </svg>
  `;

  // Convert SVG to base64
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

// don't add verification token since this user story is for visitors (U12)
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { checkIn, checkOut, city, name, starRating, minPrice, maxPrice } = getSearchParams(request);

    if (!checkIn || !checkOut || !city) {
        return NextResponse.json({ error: "checkIn, checkOut, and city are required" }, { status: 400 });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    if (checkInDate >= checkOutDate) {
        return NextResponse.json({ error: "Invalid check-in/check-out dates" }, { status: 400 });
    }

    if (typeof city !== "string" || city.trim() === "") {
        return NextResponse.json({ error: "City must be a non-empty string." }, { status: 400 });
    }
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        return NextResponse.json({ error: "Name must be a non-empty string if provided." }, { status: 400 });
    }

    if (starRating !== undefined && isNaN(Number(starRating))) {
        return NextResponse.json({ error: "starRating must be a valid number." }, { status: 400 });
    }
    if (minPrice !== undefined && isNaN(Number(minPrice))) {
        return NextResponse.json({ error: "minPrice must be a valid number." }, { status: 400 });
    }
    if (maxPrice !== undefined && isNaN(Number(maxPrice))) {
        return NextResponse.json({ error: "maxPrice must be a valid number." }, { status: 400 });
    }
  
    // From Exercise 4
    // We build whereClause conditionally so only provided parameters become filters
    // This way, missing parameters do not restrict the query
    const whereClause: any = {};
    if (city) whereClause.location = { contains: city }; 
    if (name) whereClause.name = { contains: name };
    
    // Handle star rating to support the "+" functionality (e.g., 4+ means 4 or higher)
    if (starRating) {
        whereClause.starRating = { gte: Number(starRating) }; // gte means greater than or equal to
    }

    try {
        let hotels;
        // making sure to find hotels with availableRooms > 0
        if(minPrice && maxPrice) {
            hotels = await prisma.hotel.findMany({
                where: whereClause,
                include: {
                    rooms: {
                        where: { 
                            availableRooms: { gt: 0 }, // gt: 0 => greater than 0
                            pricePerNight: { gte: Number(minPrice), lte: Number(maxPrice) }, // gte is >=, lte is <=
                            bookings: { // only include rooms that don't have overlapping bookings
                                none: {
                                    checkIn: { lt: checkOutDate },
                                    checkOut: { gt: checkInDate },
                                }
                            }
                        }, 
                        orderBy: { pricePerNight: "asc" }, // need to order by b/c we need "starting price" later
                    },
                },
            });
        } else {
            hotels = await prisma.hotel.findMany({
                where: whereClause,
                include: {
                    rooms: {
                        where: { 
                            availableRooms: { gt: 0 },
                            bookings: { // only include rooms that don't have overlapping bookings
                                none: {
                                    checkIn: { lt: checkOutDate },
                                    checkOut: { gt: checkInDate },
                                }
                            } 
                        
                        }, // gt: 0 => greater than 0
                        orderBy: { pricePerNight: "asc" }, // need to order by b/c we need "starting price" later
                    },
                },
            });
        }

        // remove hotels that have no rooms available based on the filtering
        hotels = hotels.filter((hotel) => hotel.rooms.length > 0);

        // calculate starting price for each room if available
        const results = await Promise.all( // if we use async callback in Array.map we need to wrap it with Promise.all so that all promises resolve before returning results
            hotels.map(async (hotel) => {
                let startingPrice = null;
                if (hotel.rooms.length > 0) {
                    startingPrice = hotel.rooms[0].pricePerNight; // since we ordered by pricePerNight, hotel.rooms[0] will be lowest price
                }

                let coordinates;
                try {
                    coordinates = await geocodeAddress(`${hotel.address}, ${hotel.location}`);
                } catch (err) {
                    console.error("Geocoding error:", err);
                    coordinates = { lat: null, lng: null };
                }

                return {
                    id: hotel.id,
                    name: hotel.name,
                    logo: hotel.logo,
                    address: hotel.address,
                    location: hotel.location,
                    starRating: hotel.starRating,
                    startingPrice,
                    coordinates  // need to use geocoding API
                };
            })
        );

        return NextResponse.json({ results }, { status: 200 });

    } catch (error: any) {
        console.error("Error retrieving hotels:", error.stack);
        return NextResponse.json({ error: "Internal Server Error", details: "An error occurred" }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    // Verify that the user is authenticated
    const tokenData = await verifyToken(request);
    if (!tokenData) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, logo, address, location, starRating, images } = await request.json();

        // Validate required fields
        if (typeof name !== 'string' || name.trim() === "") {
            return NextResponse.json({ error: "Hotel name must be a non-empty string." }, { status: 400 });
        }
        if (typeof address !== 'string' || address.trim() === "") {
            return NextResponse.json({ error: "Address must be a non-empty string." }, { status: 400 });
        }
        if (typeof location !== 'string' || location.trim() === "") {
            return NextResponse.json({ error: "Location must be a non-empty string." }, { status: 400 });
        }
        if (starRating === undefined || isNaN(Number(starRating))) {
            return NextResponse.json({ error: "Star rating must be a valid number." }, { status: 400 });
        }

        // If no logo is provided, generate a sophisticated logo
        const finalLogo = logo 
            ? (isValidUrl(logo) 
                ? logo 
                : NextResponse.json({ error: "Logo must be a valid URL." }, { status: 400 }))
            : generateHotelLogo(name);

        // check if optional parameters are provided, if they are then validate those too
        if (images && Array.isArray(images)) {
            for (const img of images) {
                if (!isValidUrl(img)) {
                    return NextResponse.json({ error: "All images must be valid URLs." }, { status: 400 });
                }
            }
        } else if (images) {
            return NextResponse.json({ error: "Images must be provided as an array." }, { status: 400 });
        }

        // The authenticated user will become the owner of the hotel
        const ownerId = tokenData.userId;

        // Create a new hotel, connecting the hotel with an existing owner using ownerId
        const hotel = await prisma.hotel.create({
            data: {
                name,
                logo: finalLogo,
                address,
                location,
                starRating,
                images,
                owner: {
                    connect: { id: ownerId },
                },
            },
        });

        return NextResponse.json(hotel, { status: 201 });
    } catch (error: any) {
        console.error('Error creating hotel:', error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// source: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isValidUrl(string: string): boolean {
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(string);
}
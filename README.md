# FlyNext

FlyNext is a comprehensive travel booking application that supports hotel and flight reservations, with integrated travel suggestions and user role-based functionality. It serves regular users, visitors, and hotel owners, providing tools for booking, management, and content moderation.

## Features

- **Hotel & Flight Booking**: Search and book flights and hotels with intelligent suggestions based on your selection.
- **User Roles**:
  - Visitors can browse hotels and flights.
  - Logged-in users can make bookings, manage their profile, and view their cart.
  - Hotel owners can manage their own hotels, rooms, availability, and related bookings.
- **Hotel Management**: Add, edit, and manage hotels, room types, availability, and bookings.
- **Flight Suggestions**: Suggests flights when users view or book a hotel.
- **Hotel Suggestions**: Suggests hotels when users search for a flight destination.
- **Authentication & Authorization**: Secure login, signup, and JWT-based session management.
- **Booking Management**: Users can cancel, confirm, or view their hotel and flight bookings.
- **Notification System**: Get alerts for booking updates and confirmation statuses.
- **OpenAPI Integration**: RESTful endpoints documented using OpenAPI specification.

## Technologies Used

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: JWT + Cookies
- **Cloud**: Supabase (PostgreSQL DB), Vercel (Deployment)
- **Storage**: ImageKit for image uploads
- **Maps**: Leaflet for hotel location maps
- **Docker**: Dockerized for local development with multi-container setup (AFS + App)

## API Documentation

- **Swagger/OpenAPI**: See `collection.openapi` for detailed API documentation.
- **Postman Collection**: See `postman_collection.json` to test the endpoints easily.

## Setup Instructions

To run the application locally with Docker:

```bash
./start.sh       # Starts the application (FlyNext + AFS)
./import-data.sh # Seeds the database with initial hotel, flight, city, and airport data
./stop.sh        # Stops and cleans up containers
```

## Folder Structure

- `app/`: Main frontend app including routes, pages, and API endpoints
- `components/`: All shared UI components (forms, dropdowns, etc.)
- `afs/`: Advanced Flight System backend microservice with its own database and APIs
- `prisma/`: Prisma schemas and migrations for both FlyNext and AFS
- `scripts/`: Utilities like city/airport data fetching
- `utils/`: Helper functions (auth, validation, flight logic, etc.)
- `docker-compose.yaml`: Multi-container setup for FlyNext and AFS
- `import-data.sh`: Script to seed city, airport, hotel, and room data

## Live Deployment

You can access the deployed FlyNext application here:  
**https://flynext.ca**

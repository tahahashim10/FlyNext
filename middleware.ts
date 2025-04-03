import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Configuration for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Helper function to verify JWT token without relying on verifyToken
async function verifyJWT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes accessible by visitors (without login)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/terms-and-conditions',
    '/privacy-policy',
    '/accessibility',
  ];

  // Routes accessible by any logged-in user
  const userRoutes = [
    '/bookings',
    '/bookings/user',
    '/checkout/cart',
    '/hotels/management',
    '/hotels/add',
  ];

  // Check if the path is for a specific hotel detail page
  const hotelDetailRegex = /^\/hotels\/(\d+)$/;
  const isHotelDetailPage = hotelDetailRegex.test(pathname);

  // Check if the path is for hotel owner specific routes
  const hotelOwnerRouteRegex = /^\/hotels\/(\d+)\/(edit|rooms\/add|roomTypes|availability)$/;
  const hotelOwnerBookingsRegex = /^\/bookings\/manage$/;

  // Extract hotelId from pathname or query parameter
  let hotelId: string | null = null;
  
  if (hotelOwnerRouteRegex.test(pathname)) {
    const match = pathname.match(hotelOwnerRouteRegex);
    if (match && match[1]) {
      hotelId = match[1];
    }
  } else if (hotelOwnerBookingsRegex.test(pathname)) {
    // For bookings/manage, get hotelId from query parameter
    const url = new URL(request.url);
    hotelId = url.searchParams.get('hotelId');
  }

  // Get user from token
  const tokenData = await verifyJWT(request);
  const isAuthenticated = !!tokenData;

  // ROUTE ACCESS CONTROL
  
  // Case 1: Public routes - allow access
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Case 2: Hotel detail pages - allow access to all users
  if (isHotelDetailPage) {
    return NextResponse.next();
  }

  // Case 3: Checkout confirmation page - allow access to logged-in users
  if (pathname.startsWith('/checkout/confirmation')) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Case 4: User routes - require authentication
  if (userRoutes.includes(pathname)) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Case 5: Hotel owner specific routes - require authentication AND ownership
  // For middleware, we'll defer the ownership check to the API route/page component
  // to avoid the complexity that was causing the build error
  if ((hotelOwnerRouteRegex.test(pathname) || hotelOwnerBookingsRegex.test(pathname)) && hotelId) {
    // If not authenticated at all, redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow authenticated users to proceed to the route
    // The component itself should verify ownership and handle unauthorized access
    return NextResponse.next();
  }

  // Default: If path doesn't match any patterns and user is not authenticated, 
  // redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For any other routes, allow access to authenticated users
  return NextResponse.next();
}
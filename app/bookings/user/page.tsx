'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Booking {
  id: number;
  hotel?: { name: string; location: string };
  room?: { name: string; pricePerNight: number };
  checkIn?: string;
  checkOut?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED' | 'COMPLETED';
  flightBookingReference?: string;
  flightIds?: string[]; // flightIds is stored as an array
  // Optionally, if enriched by your API:
  origin?: { city: string; country: string };
  destination?: { city: string; country: string };
  departureTime?: string;
  arrivalTime?: string;
}

const BookingStatusIcons = {
  CONFIRMED: {
    icon: CheckCircle2,
    color: 'text-green-500',
    label: 'Confirmed'
  },
  PENDING: {
    icon: Clock,
    color: 'text-yellow-500',
    label: 'Pending'
  },
  CANCELED: {
    icon: AlertCircle,
    color: 'text-red-500',
    label: 'Canceled'
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: 'text-blue-500',
    label: 'Completed'
  }
};

interface FlightDetailsData {
  origin: { city: string; country: string };
  destination: { city: string; country: string };
  flightNumber?: string;
  // include any other fields you might want
}

function FlightDetails({ flightId }: { flightId: string }) {
  const [details, setDetails] = useState<FlightDetailsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/flights/${flightId}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        } else {
          const errText = await res.text();
          setError(`Error: ${errText}`);
        }
      } catch (err: any) {
        setError('Failed to fetch flight details');
      }
    }
    fetchDetails();
  }, [flightId]);

  if (error) return <span className="text-sm text-muted">{error}</span>;
  if (!details) return <span className="text-sm text-muted">Loading flight info...</span>;

  return (
    <span className="text-sm text-muted">
      {details.origin.city}, {details.origin.country} → {details.destination.city}, {details.destination.country}
    </span>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<{ 
    hotelBookings: Booking[]; 
    flightBookings: Booking[] 
  }>({
    hotelBookings: [],
    flightBookings: []
  });
  
  // Global fetch error (for bookings retrieval)
  const [fetchError, setFetchError] = useState('');
  
  // Cancellation messages/errors for hotel bookings
  const [cancelHotelMessage, setCancelHotelMessage] = useState('');
  const [cancelHotelError, setCancelHotelError] = useState('');
  
  // Cancellation messages/errors for flight bookings
  const [cancelFlightMessage, setCancelFlightMessage] = useState('');
  const [cancelFlightError, setCancelFlightError] = useState('');

  // Pagination state
  const [hotelPage, setHotelPage] = useState(1);
  const [flightPage, setFlightPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBookings = async () => {
    setFetchError('');
    try {
      const res = await fetch('/api/bookings/user', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setFetchError(data.error || 'Failed to fetch bookings');
      } else {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err: any) {
      setFetchError('Error fetching bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number, bookingType: 'hotel' | 'flight') => {
    // Clear cancellation messages for both types
    setCancelHotelMessage('');
    setCancelHotelError('');
    setCancelFlightMessage('');
    setCancelFlightError('');
    try {
      const res = await fetch('/api/bookings/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingType }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        if (bookingType === 'hotel') {
          setCancelHotelError(data.error || 'Failed to cancel booking');
        } else {
          setCancelFlightError(data.error || 'Failed to cancel booking');
        }
      } else {
        if (bookingType === 'hotel') {
          setCancelHotelMessage('Booking canceled successfully');
        } else {
          setCancelFlightMessage('Booking canceled successfully');
        }
        fetchBookings();
      }
    } catch (err: any) {
      if (bookingType === 'hotel') {
        setCancelHotelError('Error canceling booking');
      } else {
        setCancelFlightError('Error canceling booking');
      }
    }
  };

  const renderPagination = (
    totalItems: number, 
    currentPage: number, 
    setPage: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const getPageRange = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      const range = [];
      range.push(1);
      
      if (currentPage > 3 && currentPage < totalPages - 2) {
        if (currentPage > 4) {
          range.push(-1);
        }
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        if (currentPage < totalPages - 3) {
          range.push(-2);
        }
      } else {
        if (currentPage <= 3) {
          range.push(2, 3, 4);
          range.push(-1);
        } else {
          range.push(-1);
          range.push(totalPages - 3, totalPages - 2, totalPages - 1);
        }
      }
      
      if (!range.includes(totalPages)) {
        range.push(totalPages);
      }
      
      return range;
    };
    
    return (
      <div className="flex justify-center items-center space-x-4 mt-6 min-h-[48px]">
        <button 
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-3">
          {getPageRange().map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <span 
                  key={`ellipsis-${index}`} 
                  className="px-2 text-muted"
                >
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`btn btn-square btn-sm w-10 ${
                  currentPage === page 
                    ? 'btn-primary text-primary-content' 
                    : 'btn-ghost'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  const renderBookingCard = (booking: Booking, type: 'hotel' | 'flight') => {
    const StatusIcon = BookingStatusIcons[booking.status];
    const isCancellable = booking.status !== 'CANCELED' && booking.status !== 'COMPLETED';
    
    return (
      <div 
        key={booking.id} 
        className="bg-card border border-border rounded-lg p-6 mb-4 flex items-center justify-between hover:shadow-card transition-shadow"
      >
        <div className="flex items-center space-x-6">
          {type === 'hotel' ? (
            <Hotel className="h-10 w-10 text-primary" />
          ) : (
            <Plane className="h-10 w-10 text-primary" />
          )}
          
          <div>
            {type === 'hotel' ? (
              <>
                <h3 className="text-lg font-semibold">{booking.hotel?.name}</h3>
                <p className="text-muted text-sm">
                  {booking.room?.name} | {booking.checkIn && booking.checkOut 
                    ? `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`
                    : 'Dates not specified'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Flight Booking</h3>
                <p className="text-muted text-sm">
                  Flight Ref: {booking.flightBookingReference || 'N/A'} | Flight ID: {booking.flightIds && booking.flightIds[0] ? booking.flightIds[0] : 'N/A'}
                </p>
                {booking.origin && booking.destination ? (
                  <p className="text-muted text-sm">
                    {booking.origin.city}, {booking.origin.country} → {booking.destination.city}, {booking.destination.country}
                  </p>
                ) : booking.flightIds && booking.flightIds[0] ? (
                  // If origin/destination are missing, fetch details via FlightDetails component
                  <FlightDetails flightId={booking.flightIds[0]} />
                ) : (
                  <p className="text-muted text-sm">Origin/Destination not available</p>
                )}
              </>
            )}
            
            <div className="flex items-center space-x-2 mt-2">
              <StatusIcon.icon className={`h-4 w-4 mr-1 ${StatusIcon.color}`} />
              <span className={`text-sm ${StatusIcon.color}`}>{StatusIcon.label}</span>
            </div>
          </div>
        </div>
        
        {isCancellable && (
          <button 
            onClick={() => handleCancel(booking.id, type)} 
            className="btn btn-warning btn-sm text-sm"
          >
            Cancel Booking
          </button>
        )}
      </div>
    );
  };

  // Paginate bookings
  const paginatedHotelBookings = bookings.hotelBookings
    .slice((hotelPage - 1) * itemsPerPage, hotelPage * itemsPerPage);
  
  const paginatedFlightBookings = bookings.flightBookings
    .slice((flightPage - 1) * itemsPerPage, flightPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">My Bookings</h2>
          
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{fetchError}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Hotel className="h-6 w-6 mr-2 text-primary" />
                Hotel Bookings
              </h3>
              
              {/* Hotel cancellation messages */}
              {cancelHotelError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                  <p>{cancelHotelError}</p>
                </div>
              )}
              {cancelHotelMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                  <p>{cancelHotelMessage}</p>
                </div>
              )}
              
              {bookings.hotelBookings.length > 0 ? (
                <>
                  {paginatedHotelBookings.map(booking => renderBookingCard(booking, 'hotel'))}
                  {renderPagination(
                    bookings.hotelBookings.length, 
                    hotelPage, 
                    setHotelPage
                  )}
                </>
              ) : (
                <p className="text-muted text-center py-6 bg-card border border-border rounded-lg">
                  No hotel bookings found.
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Plane className="h-6 w-6 mr-2 text-primary" />
                Flight Bookings
              </h3>
              
              {/* Flight cancellation messages appear directly above Flight Bookings */}
              {cancelFlightError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                  <p>{cancelFlightError}</p>
                </div>
              )}
              {cancelFlightMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                  <p>{cancelFlightMessage}</p>
                </div>
              )}
              
              {bookings.flightBookings.length > 0 ? (
                <>
                  {paginatedFlightBookings.map(booking => renderBookingCard(booking, 'flight'))}
                  {renderPagination(
                    bookings.flightBookings.length, 
                    flightPage, 
                    setFlightPage
                  )}
                </>
              ) : (
                <p className="text-muted text-center py-6 bg-card border border-border rounded-lg">
                  No flight bookings found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

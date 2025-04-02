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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<{ 
    hotelBookings: Booking[]; 
    flightBookings: Booking[] 
  }>({
    hotelBookings: [],
    flightBookings: []
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Pagination state
  const [hotelPage, setHotelPage] = useState(1);
  const [flightPage, setFlightPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBookings = async () => {
    setError('');
    try {
      const res = await fetch('/api/bookings/user', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch bookings');
      } else {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err: any) {
      setError('Error fetching bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number, bookingType: 'hotel' | 'flight') => {
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/bookings/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingType }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to cancel booking');
      } else {
        setMessage('Booking canceled successfully');
        fetchBookings();
      }
    } catch (err: any) {
      setError('Error canceling booking');
    }
  };

  const renderPagination = (
    totalItems: number, 
    currentPage: number, 
    setPage: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Helper function to generate page range
    const getPageRange = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      const range = [];
      
      // Always show first page
      range.push(1);
      
      // Determine middle pages
      if (currentPage > 3 && currentPage < totalPages - 2) {
        // Add ellipsis if we're not near the start
        if (currentPage > 4) {
          range.push(-1); // -1 represents ellipsis
        }
        
        // Add pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        
        // Add ellipsis if we're not near the end
        if (currentPage < totalPages - 3) {
          range.push(-2); // -2 represents another possible ellipsis
        }
      } else {
        // Near start or end, show first few or last few pages
        if (currentPage <= 3) {
          range.push(2, 3, 4);
          range.push(-1); // ellipsis
        } else {
          range.push(-1); // ellipsis
          range.push(totalPages - 3, totalPages - 2, totalPages - 1);
        }
      }
      
      // Always show last page
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
              <h3 className="text-lg font-semibold">Flight Booking</h3>
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
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{error}</p>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
              <p>{message}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Hotel className="h-6 w-6 mr-2 text-primary" />
                Hotel Bookings
              </h3>
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
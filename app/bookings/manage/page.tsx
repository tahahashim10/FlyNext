'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Clock,
  X 
} from 'lucide-react';
import RoomTypeAutoComplete from '@/components/RoomTypeAutoComplete';

interface Booking {
  id: number;
  hotel: {
    name: string;
  };
  room: {
    name: string;
  };
  checkIn: string;
  checkOut: string;
  status: string;
}

export default function ManageBookingsPage() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    room: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debounce timeout state
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchBookings = async () => {
    setError('');
    setMessage('');
    let query = `?`;
    if (filters.startDate) query += `startDate=${filters.startDate}&`;
    if (filters.endDate) query += `endDate=${filters.endDate}&`;
    if (filters.room) query += `room=${encodeURIComponent(filters.room)}`;
    try {
      const res = await fetch(`/api/bookings/owner${query}`, { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch bookings');
      } else {
        const data = await res.json();
        setBookings(data);
        setCurrentPage(1); // Reset to first page when filters change
      }
    } catch (err: any) {
      setError('Error fetching bookings');
    }
  };

  // Debounce filter changes
  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 500);
    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCancel = async (bookingId: number) => {
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to cancel booking');
      } else {
        setMessage('Booking canceled successfully');
        fetchBookings(); // refresh list after cancellation
      }
    } catch (err: any) {
      setError('Error canceling booking');
    }
  };

  // Pagination helper function
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

  // Paginate bookings
  const paginatedBookings = bookings
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper function to get status color and icon
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { color: 'text-green-600', icon: CheckCircle2 };
      case 'CANCELED':
        return { color: 'text-red-600', icon: X };
      case 'PENDING':
        return { color: 'text-yellow-600', icon: Clock };
      default:
        return { color: 'text-muted', icon: BookOpen };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">Manage Bookings</h1>
              <p className="mt-4 text-lg max-w-2xl">
                View and manage your hotel bookings
              </p>
            </div>
          </div>

          {/* Notifications */}
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

          {/* Filters Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="h-6 w-6 mr-2 text-primary" />
              Filter Bookings
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Start Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleDateChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold">End Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleDateChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Room Type</label>
                <RoomTypeAutoComplete
                  value={filters.room}
                  onChange={(value: any) => setFilters({ ...filters, room: value })}
                />
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-primary" />
              Booking List
            </h3>
            {bookings.length === 0 ? (
              <div className="bg-background border border-border rounded-lg p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="text-muted">No bookings found.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedBookings.map((booking) => {
                    const StatusIcon = getStatusDetails(booking.status).icon;
                    const statusColor = getStatusDetails(booking.status).color;

                    return (
                      <div 
                        key={booking.id} 
                        className="bg-background border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{booking.hotel?.name}</h4>
                              <p className="text-muted text-sm">{booking.room?.name}</p>
                            </div>
                            <div className={`flex items-center ${statusColor}`}>
                              <StatusIcon className="h-5 w-5 mr-1" />
                              <span className="font-semibold text-sm">{booking.status}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between text-sm text-muted">
                            <span>
                              {new Date(booking.checkIn).toLocaleDateString()} - 
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {booking.status !== 'CANCELED' && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-warning btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {renderPagination(
                  bookings.length, 
                  currentPage, 
                  setCurrentPage
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
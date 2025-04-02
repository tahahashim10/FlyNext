'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  RefreshCw 
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

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600';
      case 'CANCELED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-yellow-600';
      default:
        return 'text-muted';
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Booking ID</th>
                      <th className="p-3 text-left">Hotel</th>
                      <th className="p-3 text-left">Room</th>
                      <th className="p-3 text-left">Check-In</th>
                      <th className="p-3 text-left">Check-Out</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="border-b last:border-b-0 hover:bg-muted/5 transition-colors"
                      >
                        <td className="p-3">{booking.id}</td>
                        <td className="p-3">{booking.hotel?.name}</td>
                        <td className="p-3">{booking.room?.name}</td>
                        <td className="p-3">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className={`font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {booking.status !== 'CANCELED' && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="btn btn-warning btn-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
      <div className="mb-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleDateChange}
            className="input input-bordered"
            placeholder="Start Date"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleDateChange}
            className="input input-bordered"
            placeholder="End Date"
          />
          <div className="flex-1">
            <RoomTypeAutoComplete
              value={filters.room}
              onChange={(value: any) => setFilters({ ...filters, room: value })}
            />
          </div>
        </div>
        {/* With debounce, results update automatically; no manual button required */}
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-500 mb-2">{message}</p>}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Hotel</th>
              <th>Room</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.hotel?.name}</td>
                <td>{booking.room?.name}</td>
                <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                <td>{booking.status}</td>
                <td>
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
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

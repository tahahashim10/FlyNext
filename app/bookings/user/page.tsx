'use client';

import { useState, useEffect } from 'react';

interface Booking {
  id: number;
  hotel?: { name: string; location: string };
  room?: { name: string; pricePerNight: number };
  checkIn?: string;
  checkOut?: string;
  status: string;
  flightBookingReference?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<{ hotelBookings: Booking[]; flightBookings: Booking[] }>({
    hotelBookings: [],
    flightBookings: []
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-500 mb-2">{message}</p>}
      <div className="mb-4">
        <h3 className="font-semibold">Hotel Bookings</h3>
        {bookings.hotelBookings.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.hotelBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.hotel?.name}</td>
                  <td>{booking.room?.name}</td>
                  <td>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-'}</td>
                  <td>{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '-'}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status !== 'CANCELED' && (
                      <button onClick={() => handleCancel(booking.id, 'hotel')} className="btn btn-warning btn-sm">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hotel bookings found.</p>
        )}
      </div>
      <div>
        <h3 className="font-semibold">Flight Bookings</h3>
        {bookings.flightBookings.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Flight Ref</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.flightBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.flightBookingReference}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status !== 'CANCELED' && (
                      <button onClick={() => handleCancel(booking.id, 'flight')} className="btn btn-warning btn-sm">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No flight bookings found.</p>
        )}
      </div>
    </div>
  );
}

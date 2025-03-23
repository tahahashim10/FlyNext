'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface RoomAvailability {
  room: {
    id: number;
    name: string;
    totalRooms: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  bookingsCount: number;
  availableRooms: number;
}

export default function RoomAvailabilityPage() {
  const params = useParams();
  const hotelId = params?.id;
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availability, setAvailability] = useState<RoomAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For demonstration, assume a fixed roomId; ideally, you'd allow the user to select a room type.
  const roomId = 1;

  const fetchAvailability = async () => {
    if (!checkIn || !checkOut || !hotelId) return;
    try {
      const res = await fetch(
        `/api/hotels/availability/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}`
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error fetching availability');
      } else {
        const data = await res.json();
        setAvailability(data);
      }
    } catch (err: any) {
      setError('Error fetching availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAvailability(null);
    await fetchAvailability();
  };

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Room Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="label">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="flex-1">
            <label className="label">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Check Availability
        </button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
      {availability && (
        <div className="border p-4 rounded">
          <h3 className="text-xl font-bold">Room: {availability.room.name}</h3>
          <p>
            Total Rooms: {availability.room.totalRooms} | Booked:{' '}
            {availability.bookingsCount} | Available: {availability.availableRooms}
          </p>
          <p>
            Date Range: {availability.dateRange.startDate} to{' '}
            {availability.dateRange.endDate}
          </p>
        </div>
      )}
    </div>
  );
}

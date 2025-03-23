'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';

interface RoomType {
  id: number;
  name: string;
  remainingRooms: number;
  totalAvailableRooms: number;
  pricePerNight: number;
  amenities: string[];
}

export default function RoomAvailabilityPage() {
  const params = useParams();
  const hotelId = params?.id; // hotel id from URL
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    if (!checkIn || !checkOut || !hotelId) return;
    try {
      // Using the route: /api/hotels/{id}/rooms?checkIn=...&checkOut=...
      const res = await fetch(`/api/hotels/${hotelId}/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error fetching availability');
      } else {
        const data = await res.json();
        console.log('Fetched availability data:', data); // Debug log

        // If data is an array, use it directly.
        if (Array.isArray(data)) {
          setRooms(data);
        }
        // If data.results exists and is an array, use that.
        else if (data.results && Array.isArray(data.results)) {
          setRooms(data.results);
        }
        else {
          setError('Unexpected response format');
        }
      }
    } catch (err: any) {
      setError('Error fetching availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRooms([]);
    await fetchAvailability();
  };

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Room Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
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
      {rooms.length > 0 ? (
        <div className="border p-4 rounded">
          {rooms.map((room) => (
            <div key={room.id} className="mb-4">
              <h3 className="text-xl font-bold">Room: {room.name}</h3>
              <p>Price Per Night: {room.pricePerNight || 'N/A'}</p>
              <p>
                Total Rooms: {room.totalAvailableRooms || 'N/A'} | Available: {room.remainingRooms || 'N/A'}
              </p>
              <p>
                Amenities: {room.amenities && room.amenities.length > 0 ? room.amenities.join(', ') : 'None'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No rooms found.</p>
      )}
    </div>
  );
}

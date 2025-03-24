'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Room {
  id: number;
  name: string;
  availableRooms: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

interface Hotel {
  id: number;
  name: string;
  rooms: Room[];
}

export default function AvailabilityPage() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [error, setError] = useState('');
  const [checkDates, setCheckDates] = useState({ startDate: '', endDate: '', roomId: '' });
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [updateValues, setUpdateValues] = useState<Record<number, string>>({});

  // Fetch hotel details to obtain room types
  useEffect(() => {
    if (!hotelId) return;
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch hotel details');
        } else {
          const data = await res.json();
          setHotel(data);
        }
      } catch (err: any) {
        setError('Error fetching hotel details');
      }
    };
    fetchHotel();
  }, [hotelId]);

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCheckDates({ ...checkDates, [e.target.name]: e.target.value });
  };

  const checkAvailability = async () => {
    setError('');
    setAvailabilityResult(null);
    if (!checkDates.startDate || !checkDates.endDate || !checkDates.roomId) {
      setError('Please select a room type and both dates.');
      return;
    }
    try {
      const res = await fetch(
        `/api/hotels/availability?startDate=${checkDates.startDate}&endDate=${checkDates.endDate}&roomId=${checkDates.roomId}`
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to check availability');
      } else {
        const data = await res.json();
        setAvailabilityResult(data);
      }
    } catch (err: any) {
      setError('Error checking availability');
    }
  };

  const handleUpdateChange = (roomId: number, value: string) => {
    setUpdateValues({ ...updateValues, [roomId]: value });
  };

  const updateAvailability = async (roomId: number) => {
    setError('');
    try {
      const newValue = Number(updateValues[roomId]);
      const res = await fetch(`/api/hotels/availability/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableRooms: newValue })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update availability');
      } else {
        const data = await res.json();
        if (hotel) {
          const updatedRooms = hotel.rooms.map(room =>
            room.id === roomId ? { ...room, availableRooms: data.room.availableRooms } : room
          );
          setHotel({ ...hotel, rooms: updatedRooms });
        }
      }
    } catch (err: any) {
      setError('Error updating availability');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Room Availability & Update</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Section: Check Room Availability */}
      <div className="border p-4 rounded mb-6">
        <h3 className="text-xl font-semibold mb-2">Check Room Availability</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            name="roomId"
            value={checkDates.roomId}
            onChange={handleCheckChange}
            className="select select-bordered flex-1"
          >
            <option value="">Select Room Type</option>
            {hotel &&
              hotel.rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
          </select>
          <input
            type="date"
            name="startDate"
            value={checkDates.startDate}
            onChange={handleCheckChange}
            className="input input-bordered flex-1"
          />
          <input
            type="date"
            name="endDate"
            value={checkDates.endDate}
            onChange={handleCheckChange}
            className="input input-bordered flex-1"
          />
          <button onClick={checkAvailability} className="btn btn-primary">
            Check
          </button>
        </div>
        {availabilityResult && (
          <div className="mt-4">
            <p>Room: {availabilityResult.room.name}</p>
            <p>Total Rooms: {availabilityResult.room.totalRooms}</p>
            <p>Bookings Count: {availabilityResult.bookingsCount}</p>
            <p>Available Rooms: {availabilityResult.availableRooms}</p>
          </div>
        )}
      </div>

      {/* Section: Update Room Availability */}
      <div className="border p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Update Room Availability</h3>
        {hotel ? (
          <div className="space-y-4">
            {hotel.rooms.map(room => (
              <div key={room.id} className="flex flex-col md:flex-row items-center gap-4 border-b pb-2">
                <div className="flex-1">
                  <p className="font-bold">{room.name}</p>
                  <p>Current Available Rooms: {room.availableRooms}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="New Available Rooms"
                    value={updateValues[room.id] || ''}
                    onChange={(e) => handleUpdateChange(room.id, e.target.value)}
                    className="input input-bordered w-24"
                  />
                  <button onClick={() => updateAvailability(room.id)} className="btn btn-secondary btn-sm">
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading room types...</p>
        )}
      </div>
    </div>
  );
}

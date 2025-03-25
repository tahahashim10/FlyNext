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
  const { id: hotelId } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [error, setError] = useState('');
  const [checkDates, setCheckDates] = useState({ checkIn: '', checkOut: '' });
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

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckDates({ ...checkDates, [e.target.name]: e.target.value });
  };

  const checkAvailability = async () => {
    setError('');
    setAvailabilityResult(null);
    if (!checkDates.checkIn || !checkDates.checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    try {
      // Use the hotel-specific endpoint: /api/hotels/{hotelId}/rooms?checkIn=...&checkOut=...
      const res = await fetch(
        `/api/hotels/${hotelId}/rooms?checkIn=${checkDates.checkIn}&checkOut=${checkDates.checkOut}`
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to check availability');
      } else {
        const data = await res.json();
        // Expecting an array of room objects
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
        body: JSON.stringify({ availableRooms: newValue }),
        credentials: 'include'
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
          <input
            type="date"
            name="checkIn"
            value={checkDates.checkIn}
            onChange={handleCheckChange}
            className="input input-bordered flex-1"
          />
          <input
            type="date"
            name="checkOut"
            value={checkDates.checkOut}
            onChange={handleCheckChange}
            className="input input-bordered flex-1"
          />
          <button onClick={checkAvailability} className="btn btn-primary">
            Check
          </button>
        </div>
        {availabilityResult && Array.isArray(availabilityResult) && (
          <div className="mt-4">
            {availabilityResult.map((room: Room) => (
              <div key={room.id} className="border p-2 rounded mb-2">
                <p className="font-bold">{room.name}</p>
                <p>Price Per Night: {room.pricePerNight}</p>
                <p>Current Available Rooms: {room.availableRooms}</p>
                <p>Amenities: {room.amenities.join(', ')}</p>
              </div>
            ))}
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

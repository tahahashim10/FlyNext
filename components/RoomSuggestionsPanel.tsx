'use client';

import { useEffect, useState } from 'react';

interface Room {
  id: number;
  name: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string[];
  images: string[];
}

interface RoomSuggestionsPanelProps {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  onSelect: (roomId: number) => void;
}

export default function RoomSuggestionsPanel({
  hotelId,
  checkIn,
  checkOut,
  onSelect,
}: RoomSuggestionsPanelProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Append checkIn and checkOut as query parameters if provided.
        const queryParams = new URLSearchParams();
        if (checkIn) queryParams.append('checkIn', checkIn);
        if (checkOut) queryParams.append('checkOut', checkOut);
        const url = `/api/hotels/${hotelId}/rooms?${queryParams.toString()}`;
        const res = await fetch(url, {
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch room details');
          return;
        }
        const data = await res.json();
        // Expecting the API to return an object with a "results" property that is an array of rooms.
        if (data.results) {
          setRooms(data.results);
        } else {
          setError('No room details found.');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Error fetching room details');
      }
    };

    // Only fetch rooms if hotelId and both checkIn and checkOut are provided.
    if (hotelId && checkIn && checkOut) {
      fetchRooms();
    }
  }, [hotelId, checkIn, checkOut]);

  return (
    <div className="border p-4 rounded mt-2 bg-white shadow-md">
      <h4 className="font-semibold mb-2">Available Room Types</h4>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {rooms.length === 0 && !error ? (
        <p className="text-sm">No room details found.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room, index) => (
            <li
              key={`${room.id}-${index}`}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => onSelect(room.id)}
            >
              <p className="text-sm">{room.name}</p>
              <p className="text-xs">
                Price: ${room.pricePerNight} | Available: {room.availableRooms}
              </p>
              <p className="text-xs">
                Amenities: {room.amenities.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

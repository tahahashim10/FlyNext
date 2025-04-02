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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!hotelId) {
        setError('Please select a hotel first');
        return;
      }
      
      if (!checkIn) {
        setError('Please select a check-in date');
        return;
      }
      
      if (!checkOut) {
        setError('Please select a check-out date');
        return;
      }
      
      setLoading(true);
      try {
        // Append checkIn and checkOut as query parameters if provided.
        const queryParams = new URLSearchParams();
        if (checkIn) queryParams.append('checkIn', checkIn);
        if (checkOut) queryParams.append('checkOut', checkOut);
        const url = `/api/hotels/${hotelId}/rooms?${queryParams.toString()}`;
        
        console.log("Fetching rooms from:", url);
        
        const res = await fetch(url, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch room details');
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        console.log("Room data received:", data);
        
        // Expecting the API to return an object with a "results" property that is an array of rooms.
        if (data.results) {
          setRooms(data.results);
        } else {
          setError('No room details found.');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Error fetching room details');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch rooms if hotelId and both checkIn and checkOut are provided.
    if (hotelId && checkIn && checkOut) {
      fetchRooms();
    } else {
      setError('Please select a hotel and specify check-in/check-out dates');
    }
  }, [hotelId, checkIn, checkOut]);

  return (
    <div className="p-4 rounded bg-card text-foreground">
      <h4 className="font-semibold mb-2">Available Room Types</h4>
      
      {loading && (
        <p className="text-sm text-foreground/70">Loading available rooms...</p>
      )}
      
      {error && !loading && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      
      {rooms.length === 0 && !error && !loading ? (
        <p className="text-sm text-foreground/70">No available rooms found for the selected dates.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room, index) => (
            <li
              key={`${room.id}-${index}`}
              className="cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
              onClick={() => onSelect(room.id)}
            >
              <p className="text-sm">{room.name}</p>
              <p className="text-xs text-foreground/70">
                Price: ${room.pricePerNight} | Available: {room.availableRooms}
              </p>
              <p className="text-xs text-foreground/70">
                Amenities: {room.amenities.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
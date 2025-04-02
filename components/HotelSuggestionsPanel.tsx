'use client';

import { useEffect, useState } from 'react';

interface Hotel {
  id: number;
  name: string;
  starRating: number;
  address: string;
  images: string[];
}

interface HotelSuggestionsPanelProps {
  query: string; // typically the destination city input
  onSelect: (hotelId: number) => void;
}

export default function HotelSuggestionsPanel({
  query,
  onSelect,
}: HotelSuggestionsPanelProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const payload = { destination: query };
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch hotel suggestions');
          return;
        }
        const data = await res.json();
        if (data.hotels) {
          setHotels(data.hotels);
        }
      } catch (err) {
        console.error('Error fetching hotel suggestions:', err);
        setError('Error fetching hotel suggestions');
      }
    };

    if (query.trim() !== '') {
      fetchSuggestions();
    }
  }, [query]);

  return (
    <div className="p-4 rounded bg-card text-foreground">
      <h4 className="font-semibold mb-2">Hotel Suggestions</h4>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {hotels.length === 0 ? (
        <p className="text-sm text-foreground/80">No hotel suggestions found.</p>
      ) : (
        <ul className="space-y-2">
          {hotels.map((hotel, index) => (
            <li
              key={`${hotel.id}-${index}`}
              className="cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
              onClick={() => onSelect(hotel.id)}
            >
              <p className="text-sm">{hotel.name} (Rating: {hotel.starRating})</p>
              <p className="text-xs text-foreground/70">{hotel.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
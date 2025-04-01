'use client';

import { useEffect, useState } from 'react';

interface Flight {
  id: string;
  airline: {
    code: string;
    name: string;
  };
  departureTime: string;
  price: number;
  flightNumber?: string;
}

interface FlightSuggestionsPanelProps {
  hotelId: number;
  suggestedDate: string;
  departureCity: string;
  onSelect: (flightId: string) => void;
}

export default function FlightSuggestionsPanel({
  hotelId,
  suggestedDate,
  departureCity,
  onSelect,
}: FlightSuggestionsPanelProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const payload = {
          hotelId,
          departureCity,
          suggestedDate,
        };
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch flight suggestions');
          return;
        }
        const data = await res.json();
        if (data.flights) {
          // If needed, you can filter duplicates here as well
          setFlights(data.flights);
        }
      } catch (err) {
        console.error('Error fetching flight suggestions:', err);
        setError('Error fetching flight suggestions');
      }
    };

    if (hotelId && suggestedDate && departureCity) {
      fetchSuggestions();
    }
  }, [hotelId, suggestedDate, departureCity]);

  return (
    <div className="border p-4 rounded">
      <h4 className="font-semibold mb-2">Flight Suggestions</h4>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {flights.length === 0 ? (
        <p className="text-sm">No flight suggestions found.</p>
      ) : (
        <ul className="space-y-2">
          {flights.map((flight, index) => (
            <li
              key={`${flight.id}-${index}`}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => onSelect(flight.id)}
            >
              <p className="text-sm">
                {flight.airline.name} – {flight.flightNumber ? flight.flightNumber : flight.id}
              </p>
              <p className="text-xs">
                Dep: {new Date(flight.departureTime).toLocaleTimeString()} | Price: ${flight.price}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

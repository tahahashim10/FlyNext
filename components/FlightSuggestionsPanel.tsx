'use client';

import { useEffect, useState } from 'react';
import { Plane, Clock, CreditCard } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      
      try {
        const payload = {
          hotelId,
          departureCity,
          suggestedDate,
        };
        
        console.log("Fetching flight suggestions with payload:", payload);
        
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch flight suggestions');
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        console.log("Flight suggestions response:", data);
        
        if (data.flights) {
          // If needed, you can filter duplicates here as well
          setFlights(data.flights);
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error('Error fetching flight suggestions:', err);
        setError('Error fetching flight suggestions');
      } finally {
        setLoading(false);
      }
    };
    
    if (hotelId && suggestedDate && departureCity) {
      fetchSuggestions();
    } else {
      // Reset flights when any of the required parameters are missing
      setFlights([]);
      if (!hotelId) setError('Please select a hotel first');
      else if (!suggestedDate) setError('Please select a check-in date');
      else if (!departureCity) setError('Please enter a departure city');
    }
  }, [hotelId, suggestedDate, departureCity]);

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="p-4 rounded bg-card text-foreground">
      <h4 className="font-semibold mb-2 flex items-center">
        <Plane className="h-4 w-4 mr-2 text-primary" />
        Flight Suggestions
      </h4>
      
      {loading && (
        <p className="text-sm text-foreground/70">Loading flight suggestions...</p>
      )}
      
      {error && !loading && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      
      {flights.length === 0 && !error && !loading ? (
        <p className="text-sm text-foreground/70">No flight suggestions found.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {flights.map((flight, index) => (
            <div
              key={`${flight.id}-${index}`}
              className="cursor-pointer hover:bg-muted/30 p-3 rounded border border-border transition-colors"
              onClick={() => onSelect(flight.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Plane className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium text-sm">
                    {flight.airline.name} – {flight.flightNumber ? flight.flightNumber : flight.id}
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary">${flight.price}</div>
              </div>
              
              <div className="flex items-center text-xs text-foreground/70">
                <Clock className="h-3 w-3 mr-1" />
                <span>Departure: {formatTime(flight.departureTime)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
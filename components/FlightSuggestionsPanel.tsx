'use client';

import { useEffect, useState } from 'react';
import { Plane, Clock, ArrowRight, Calendar, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';

// Updated interfaces to handle multi-leg flights
interface FlightLeg {
  id: string;
  airline: {
    code: string;
    name: string;
  };
  departureTime: string;
  arrivalTime?: string;
  duration?: number;
  price: number;
  flightNumber?: string;
  origin?: {
    city: string;
    code: string;
  };
  destination?: {
    city: string;
    code: string;
  };
}

interface FlightConnection {
  id: string;
  legs: number;
  flights: FlightLeg[];
  layover?: number;
  totalDuration?: number;
  totalPrice: number;
  departureTime: string;
  arrivalTime?: string;
  mainAirline: {
    code: string;
    name: string;
  };
  origin?: string;
  destination?: string;
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
  const [connections, setConnections] = useState<FlightConnection[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotelLocation, setHotelLocation] = useState('');

  // First, fetch the hotel to get its location
  useEffect(() => {
    const fetchHotelLocation = async () => {
      if (!hotelId) return;
      
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (res.ok) {
          const hotel = await res.json();
          if (hotel && hotel.location) {
            setHotelLocation(hotel.location);
            console.log(`Hotel location: ${hotel.location}`);
          }
        } else {
          console.error("Failed to fetch hotel location");
        }
      } catch (err) {
        console.error('Error fetching hotel location:', err);
      }
    };
    
    fetchHotelLocation();
  }, [hotelId]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!hotelId || !departureCity) {
        return;
      }
      
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
          // Determine if we have connections or individual flights
          if (data.flights.some((f: any) => f.legs > 1 || f.flights)) {
            // These are flight connections
            setConnections(data.flights);
          } else {
            // Convert individual flights to our connection format
            setConnections(data.flights.map((flight: any) => ({
              id: flight.id,
              legs: 1,
              flights: [flight],
              totalPrice: flight.price,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
              mainAirline: flight.airline
            })));
          }
        } else {
          setConnections([]);
        }
      } catch (err) {
        console.error('Error fetching flight suggestions:', err);
        setError('Error fetching flight suggestions');
      } finally {
        setLoading(false);
      }
    };
    
    if (hotelId && departureCity) {
      fetchSuggestions();
    } else {
      // Reset flights when any of the required parameters are missing
      setConnections([]);
      if (!hotelId) setError('Please select a hotel first');
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

  const formatDate = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 rounded bg-card text-foreground">
      <h4 className="font-semibold mb-2 flex items-center">
        <Plane className="h-4 w-4 mr-2 text-primary" />
        Flight Suggestions
      </h4>
      
      {/* Search criteria info */}
      <div className="mb-3 text-xs bg-muted/20 p-2 rounded">
        <div className="flex items-center mb-1">
          <MapPin className="h-3 w-3 mr-1 text-primary" />
          <span>From: <span className="font-medium">{departureCity || 'Not selected'}</span></span>
        </div>
        
        {hotelLocation && (
          <div className="flex items-center mb-1">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            <span>To: <span className="font-medium">{hotelLocation}</span></span>
          </div>
        )}
        
        {suggestedDate && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-primary" />
            <span>Date: <span className="font-medium">{new Date(suggestedDate).toLocaleDateString()}</span></span>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="text-sm text-foreground/70 py-6 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Loading flight suggestions...
        </div>
      )}
      
      {error && !loading && (
        <div className="text-destructive text-sm p-2 bg-destructive/10 rounded flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      {connections.length === 0 && !error && !loading ? (
        <div className="text-center py-6 text-foreground/70">
          <Plane className="h-8 w-8 mx-auto mb-2 text-foreground/40" />
          <p className="text-sm">No flight suggestions found matching your criteria.</p>
          <p className="text-xs mt-1">
            Try another date or check different departure/destination cities.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {connections.map((connection, index) => (
            <div
              key={`${connection.id}-${index}`}
              className="cursor-pointer hover:bg-muted/30 p-3 rounded border border-border transition-colors"
              onClick={() => onSelect(connection.id)}
            >
              {/* Header with airline and price */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Plane className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium text-sm">
                    {connection.mainAirline.name} 
                    {connection.legs > 1 ? ` (${connection.legs} flights)` : ''}
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary">
                  ${connection.totalPrice || connection.flights[0].price}
                </div>
              </div>
              
              {/* Departure and arrival times */}
              <div className="flex justify-between items-center text-xs text-foreground/80 mb-2">
                <div>
                  <div className="font-semibold">
                    {formatTime(connection.departureTime)}
                  </div>
                  <div>{formatDate(connection.departureTime)}</div>
                </div>
                
                <div className="flex-1 px-2 text-center">
                  {connection.legs > 1 ? (
                    <div className="text-xs text-foreground/60">
                      {formatDuration(connection.totalDuration)}
                      {connection.layover ? ` (${Math.floor(connection.layover / 60)}h layover)` : ''}
                    </div>
                  ) : (
                    <ArrowRight className="h-3 w-3 mx-auto text-foreground/40" />
                  )}
                </div>
                
                <div>
                  <div className="font-semibold">
                    {connection.arrivalTime ? formatTime(connection.arrivalTime) : 'N/A'}
                  </div>
                  <div>{connection.arrivalTime ? formatDate(connection.arrivalTime) : ''}</div>
                </div>
              </div>
              
              {/* Flight legs details if more than one */}
              {connection.legs > 1 && (
                <div className="mt-2 space-y-1">
                  {connection.flights.map((flight, legIndex) => (
                    <div key={flight.id} className="text-xs border-t border-border/30 pt-1 mt-1 first:border-t-0 first:pt-0 first:mt-0">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Leg {legIndex + 1}: {flight.airline.name}</div>
                        <div>${flight.price}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>{formatTime(flight.departureTime)}</div>
                        <div className="text-center text-foreground/60">
                          {formatDuration(flight.duration)}
                        </div>
                        <div>{flight.arrivalTime ? formatTime(flight.arrivalTime) : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
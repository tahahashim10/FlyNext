
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Plane, RefreshCw, Search } from 'lucide-react';

interface Suggestion {
  label: string;
  value: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  currency: string;
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  layovers?: any;
}

interface FlightSearchResults {
  flightThere: {
    results: Array<{
      flights: Flight[];
      legs: number;
    }>;
  };
  flightBack?: {
    results: Array<{
      flights: Flight[];
      legs: number;
    }>;
  };
}

const FlightSearchForm: React.FC = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [results, setResults] = useState<FlightSearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch suggestions from the backend endpoints.
  const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    try {
      const [citiesRes, airportsRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/airports'),
      ]);
      if (!citiesRes.ok || !airportsRes.ok) {
        console.error('Failed to fetch suggestions.');
        return [];
      }
      const cities = await citiesRes.json();
      const airports = await airportsRes.json();

      // Map cities and airports to suggestion objects.
      const citySuggestions: Suggestion[] = cities.map((c: any) => ({
        label: `${c.city}, ${c.country}`,
        value: c.city,
      }));
      const airportSuggestions: Suggestion[] = airports.map((a: any) => ({
        label: `${a.name} (${a.code})`,
        value: a.code,
      }));

      const combined = [...citySuggestions, ...airportSuggestions];
      return combined.filter((item: Suggestion) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      return [];
    }
  };

  // Auto-complete for origin.
  const handleOriginChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin(value);
    if (value.length >= 2) {
      const sugg = await fetchSuggestions(value);
      setOriginSuggestions(sugg);
    } else {
      setOriginSuggestions([]);
    }
  };

  // Auto-complete for destination.
  const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    if (value.length >= 2) {
      const sugg = await fetchSuggestions(value);
      setDestinationSuggestions(sugg);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    setIsLoading(true);

    if (!origin || !destination || !departureDate) {
      setError('Please fill in origin, destination, and departure date.');
      setIsLoading(false);
      return;
    }

    let queryParams = `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${departureDate}`;
    if (tripType === 'round-trip' && returnDate) {
      queryParams += `&returnDate=${returnDate}`;
    }

    try {
      const res = await fetch(`/api/flights${queryParams}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error fetching flights');
      } else {
        const data = await res.json();
        setResults(data);
      }
    } catch (err: any) {
      setError('Error fetching flights');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'one-way'}
                onChange={() => setTripType('one-way')}
                className="sr-only"
              />
              <div className={`px-4 py-2 rounded-full ${tripType === 'one-way' ? 'bg-primary text-white' : 'bg-muted/10'}`}>
                One way
              </div>
            </label>
            
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'round-trip'}
                onChange={() => setTripType('round-trip')}
                className="sr-only"
              />
              <div className={`px-4 py-2 rounded-full ${tripType === 'round-trip' ? 'bg-primary text-white' : 'bg-muted/10'}`}>
                Round trip
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Input with Suggestions */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Plane className="h-5 w-5 text-muted transform -rotate-45" />
              </div>
              <input
                type="text"
                placeholder="From: City or Airport"
                value={origin}
                onChange={handleOriginChange}
                className="input input-bordered w-full pl-10"
                required
              />
              {originSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
                  {originSuggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-muted/10 cursor-pointer"
                      onClick={() => {
                        setOrigin(sugg.value);
                        setOriginSuggestions([]);
                      }}
                    >
                      {sugg.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Destination Input with Suggestions */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Plane className="h-5 w-5 text-muted transform rotate-45" />
              </div>
              <input
                type="text"
                placeholder="To: City or Airport"
                value={destination}
                onChange={handleDestinationChange}
                className="input input-bordered w-full pl-10"
                required
              />
              {destinationSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
                  {destinationSuggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-muted/10 cursor-pointer"
                      onClick={() => {
                        setDestination(sugg.value);
                        setDestinationSuggestions([]);
                      }}
                    >
                      {sugg.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-5 w-5 text-muted" />
              </div>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="input input-bordered w-full pl-10"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {tripType === 'round-trip' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input input-bordered w-full pl-10"
                  min={departureDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              Search Flights
            </button>
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
      </div>

      {results && (
        <div>
          <h2 className="text-xl font-bold mb-4">Flight Results</h2>
          
          {results.flightThere?.results?.length ? (
            <div className="space-y-6">
              <h3 className="font-semibold text-muted">Outbound flights</h3>
              
              {results.flightThere.results.map((group, index: number) => (
                <div key={index} className="card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/5">
                    <span className="text-sm font-semibold">
                      {group.flights.length > 1 
                        ? `Flight Group ${index + 1} (${group.flights.length} flights)`
                        : `Direct Flight`
                      }
                    </span>
                  </div>
                  
                  {group.flights.map((flight: Flight, flightIndex: number) => (
                    <div 
                      key={flight.id} 
                      className={`p-4 ${flightIndex < group.flights.length - 1 ? 'border-b border-border border-dashed' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold">{flight.flightNumber}</span>
                            <span className="mx-2 text-muted">•</span>
                            <span className="text-sm text-muted">
                              {flight.origin?.city || "N/A"} ({flight.origin?.code || "N/A"}) → {flight.destination?.city || "N/A"} ({flight.destination?.code || "N/A"})
                            </span>

                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center">
                              <div className="text-lg font-semibold">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              <div className="mx-3 flex-1 border-t border-dashed border-muted relative">
                                <div className="absolute -top-2 left-0">
                                  <Plane size={16} className="text-primary" />
                                </div>
                                <div className="absolute -top-2.5 right-0">
                                  <MapPin size={16} className="text-muted" />
                                </div>
                              </div>
                              <div className="text-lg font-semibold">{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                            
                            <div className="text-sm">
                              <span className="bg-muted/10 px-2 py-1 rounded">
                                {formatDuration(flight.duration)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-muted">
                            <div>
                              <span>Departure: </span>
                              <span>{formatDate(flight.departureTime)}</span>
                            </div>
                            <div>
                              <span>Arrival: </span>
                              <span>{formatDate(flight.arrivalTime)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                          <div className="text-lg font-semibold mb-2">
                            {flight.price} {flight.currency}
                          </div>
                          <button
                            className="btn-primary"
                            onClick={() =>
                              router.push(`/bookings?flightIds=${encodeURIComponent(flight.id)}`)
                            }
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                      
                      {flight.layovers && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm font-medium text-muted">
                            Layovers: {JSON.stringify(flight.layovers)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Return Flights */}
              {results.flightBack && results.flightBack.results && results.flightBack.results.length > 0 && (
                <>
                  <h3 className="font-semibold text-muted mt-8">Return flights</h3>
                  {results.flightBack.results.map((group, index) => (
                    <div key={`return-${index}`} className="card overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/5">
                        <span className="text-sm font-semibold">
                          {group.flights.length > 1 
                            ? `Flight Group ${index + 1} (${group.flights.length} flights)`
                            : `Direct Flight`
                          }
                        </span>
                      </div>
                      
                      {/* Return flight details - similar structure as above */}
                      {group.flights.map((flight: Flight, flightIndex: number) => (
                        <div 
                          key={flight.id} 
                          className={`p-4 ${flightIndex < group.flights.length - 1 ? 'border-b border-border border-dashed' : ''}`}
                        >
                          {/* Same structure as outbound flights */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="font-semibold">{flight.flightNumber}</span>
                                <span className="mx-2 text-muted">•</span>
                                <span className="text-sm text-muted">
                                  {flight.origin?.city || "N/A"} ({flight.origin?.code || "N/A"}) → {flight.destination?.city || "N/A"} ({flight.destination?.code || "N/A"})
                                </span>

                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center">
                                  <div className="text-lg font-semibold">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div className="mx-3 flex-1 border-t border-dashed border-muted relative">
                                    <div className="absolute -top-2 left-0">
                                      <Plane size={16} className="text-primary" />
                                    </div>
                                    <div className="absolute -top-2.5 right-0">
                                      <MapPin size={16} className="text-muted" />
                                    </div>
                                  </div>
                                  <div className="text-lg font-semibold">{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                                
                                <div className="text-sm">
                                  <span className="bg-muted/10 px-2 py-1 rounded">
                                    {formatDuration(flight.duration)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-sm text-muted">
                                <div>
                                  <span>Departure: </span>
                                  <span>{formatDate(flight.departureTime)}</span>
                                </div>
                                <div>
                                  <span>Arrival: </span>
                                  <span>{formatDate(flight.arrivalTime)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                              <div className="text-lg font-semibold mb-2">
                                {flight.price} {flight.currency}
                              </div>
                              <button
                                className="btn-primary"
                                onClick={() =>
                                  router.push(`/bookings?flightIds=${encodeURIComponent(flight.id)}`)
                                }
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                          
                          {flight.layovers && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-sm font-medium text-muted">
                                Layovers: {JSON.stringify(flight.layovers)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
              
            </div>
          ) : (
            <div className="text-center py-10 border border-border rounded-lg">
              <p className="text-lg text-muted">No flights found matching your criteria.</p>
              <p className="mt-2">Try adjusting your search parameters or dates.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSearchForm;

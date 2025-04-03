'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Plane, RefreshCw, Search, AlertTriangle } from 'lucide-react';

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
  airline?: {
    code: string;
    name: string;
  };
  origin?: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination?: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  layovers?: any;
  // Track if this flight's details have been fetched from the API
  detailsLoaded?: boolean;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // For round-trip booking management, store selected outbound group as an array of flight IDs.
  const [selectedOutboundFlightIds, setSelectedOutboundFlightIds] = useState<string[]>([]);
  // bookingStep: "outbound" means waiting for outbound selection; "return" means outbound is selected and waiting for return.
  const [bookingStep, setBookingStep] = useState<'outbound' | 'return' | 'complete'>('outbound');
  
  // Cache for flight details that have been fetched
  const [flightDetailsCache, setFlightDetailsCache] = useState<Record<string, any>>({});

  // Check authentication status on mount.
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);
  
  // Function to fetch flight details if necessary
  const fetchFlightDetails = async (flightId: string) => {
    if (flightDetailsCache[flightId]) {
      return flightDetailsCache[flightId];
    }
    
    try {
      const res = await fetch(`/api/flights/${flightId}`);
      if (res.ok) {
        const data = await res.json();
        setFlightDetailsCache(prev => ({
          ...prev,
          [flightId]: data
        }));
        return data;
      }
    } catch (err) {
      console.error(`Failed to fetch details for flight ${flightId}:`, err);
    }
    
    return null;
  };
  
  // Function to load detailed flight information for each flight in the results
  const loadFlightDetails = async (resultsData: FlightSearchResults) => {
    const updatedResults = { ...resultsData };
    
    // Process outbound flights
    if (updatedResults.flightThere && updatedResults.flightThere.results) {
      for (const group of updatedResults.flightThere.results) {
        for (let i = 0; i < group.flights.length; i++) {
          const flight = group.flights[i];
          if (!flight.detailsLoaded) {
            const details = await fetchFlightDetails(flight.id);
            if (details) {
              group.flights[i] = {
                ...flight,
                ...details,
                detailsLoaded: true
              };
            }
          }
        }
      }
    }
    
    // Process return flights if they exist
    if (updatedResults.flightBack && updatedResults.flightBack.results) {
      for (const group of updatedResults.flightBack.results) {
        for (let i = 0; i < group.flights.length; i++) {
          const flight = group.flights[i];
          if (!flight.detailsLoaded) {
            const details = await fetchFlightDetails(flight.id);
            if (details) {
              group.flights[i] = {
                ...flight,
                ...details,
                detailsLoaded: true
              };
            }
          }
        }
      }
    }
    
    return updatedResults;
  };

  // Clear auth error when user scrolls or after a timeout.
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null);
      }, 5000);

      const handleScroll = () => {
        setAuthError(null);
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [authError]);

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

  // For handling flight leg information display
  const getFlightLegInfo = (group: { flights: Flight[] }) => {
    if (group.flights.length === 1) {
      return "Direct Flight";
    }
    
    const loadedFlights = group.flights.filter(f => f.detailsLoaded).length;
    const totalFlights = group.flights.length;
    
    if (loadedFlights < totalFlights) {
      return `Loading ${totalFlights} flight segments...`;
    }
    
    return `${totalFlights} Flight Segments`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthError(null);
    setResults(null);
    setIsLoading(true);
    setBookingStep('outbound'); // Reset booking step on new search
    setSelectedOutboundFlightIds([]); // Reset selected flight on new search

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
        
        // Set initial results with minimal information
        setResults(data);
        
        // Load detailed flight information for each flight
        const detailedResults = await loadFlightDetails(data);
        setResults(detailedResults);
        console.log("Detailed flight results:", detailedResults);
      }
    } catch (err: any) {
      setError('Error fetching flights');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the group-level route text using the first flight's origin and last flight's destination.
  const getGroupRouteText = (group: { flights: Flight[] }) => {
    const first = group.flights[0];
    const last = group.flights[group.flights.length - 1];
    
    // First flight's origin
    let originText = "";
    if (first.detailsLoaded && first.origin) {
      const originCity = first.origin.city || "";
      const originCode = first.origin.code || "";
      originText = `${originCity} ${originCode ? `(${originCode})` : ''}`;
    } else {
      originText = origin;
    }
    
    // Last flight's destination
    let destinationText = "";
    if (last.detailsLoaded && last.destination) {
      const destCity = last.destination.city || "";
      const destCode = last.destination.code || "";
      destinationText = `${destCity} ${destCode ? `(${destCode})` : ''}`;
    } else {
      destinationText = destination;
    }
    
    // For multi-leg flights, include the number of segments
    if (group.flights.length > 1) {
      return `${originText} → ${destinationText} (${group.flights.length} segments)`;
    }
    
    return `${originText} → ${destinationText}`;
  };

  // Single function to handle booking a group of flights.
  const handleBookNowGroup = (group: { flights: Flight[] }, isReturn: boolean = false) => {
    if (!isLoggedIn) {
      setAuthError("You must log in to book a flight");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Build the combined flight ids from the group.
    const groupFlightIds = group.flights.map((f) => f.id);
    if (tripType === 'one-way') {
      router.push(`/bookings?flightIds=${encodeURIComponent(groupFlightIds.join(','))}&tab=flight`);
    } else {
      // For round-trip, check which step we are on.
      if (!isReturn && bookingStep === 'outbound') {
        // If outbound group is multi-leg, book immediately.
        if (group.flights.length > 1) {
          router.push(`/bookings?flightIds=${encodeURIComponent(groupFlightIds.join(','))}&tab=flight`);
          return;
        }
        // Otherwise, set the outbound flight selection and wait for return flight.
        setSelectedOutboundFlightIds(groupFlightIds);
        setBookingStep('return');
        const returnSection = document.getElementById('return-flights-section');
        if (returnSection) {
          returnSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (isReturn && bookingStep === 'return' && selectedOutboundFlightIds.length > 0) {
        // Combine outbound and return flight ids.
        const combinedFlightIds = [...selectedOutboundFlightIds, ...groupFlightIds];
        router.push(`/bookings?flightIds=${encodeURIComponent(combinedFlightIds.join(','))}&tab=flight`);
      }
    }
  };

  // Format date nicely.
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

  // Format duration.
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md p-4 md:p-6 relative">
        {/* Authentication error message */}
        {authError && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-destructive text-white z-50 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{authError}</span>
            </div>
            <button 
              onClick={() => setAuthError(null)} 
              className="text-white hover:text-white/80"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

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
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <Plane className="h-5 w-5 text-muted transform -rotate-45" />
              </div>
              <input
                type="text"
                placeholder="From: City or Airport"
                value={origin}
                onChange={handleOriginChange}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              {originSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border" style={{ top: '100%', left: 0 }}>
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
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <Plane className="h-5 w-5 text-muted transform rotate-45" />
              </div>
              <input
                type="text"
                placeholder="To: City or Airport"
                value={destination}
                onChange={handleDestinationChange}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              {destinationSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border" style={{ top: '100%', left: 0 }}>
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
            {/* Departure Date Input */}
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-muted" />
              </div>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                min={new Date().toISOString().split('T')[0]}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            
            {tripType === 'round-trip' && (
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none z-10">
                  <Calendar className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input input-bordered w-full pl-16 focus:pl-16"
                  min={departureDate || new Date().toISOString().split('T')[0]}
                  style={{ paddingLeft: '2.5rem' }}
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

      {/* Notification banner for round-trip selection */}
      {tripType === 'round-trip' && selectedOutboundFlightIds.length > 0 && bookingStep === 'return' && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary flex items-center">
          <Plane className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Outbound flight selected!</p>
            <p className="text-sm">Please select a return flight to complete your booking.</p>
          </div>
        </div>
      )}

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
                      {getFlightLegInfo(group)}
                    </span>
                    <div className="mt-1 text-sm text-muted">
                      {getGroupRouteText(group)}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {group.flights.map((flight: Flight) => (
                      <div key={flight.id} className="border p-3 rounded">
                        <div className="flex items-center mb-2">
                          <span className="font-semibold">{flight.flightNumber || flight.airline?.name || 'Flight'}</span>
                          <span className="mx-2 text-muted">•</span>
                          {flight.detailsLoaded ? (
                            <span className="text-sm text-muted">
                              {flight.origin?.city} {flight.origin?.code ? `(${flight.origin.code})` : ''} → {flight.destination?.city} {flight.destination?.code ? `(${flight.destination.code})` : ''}
                            </span>
                          ) : (
                            <span className="text-sm text-muted flex items-center">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading flight details...
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center">
                            <div className="text-lg font-semibold">
                              {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="mx-3 flex-1 border-t border-dashed border-muted relative" style={{ minWidth: '80px' }}>
                              <div className="absolute -top-2 left-2">
                                <Plane size={16} className="text-primary" />
                              </div>
                              <div className="absolute -top-2.5 right-2">
                                <MapPin size={16} className="text-muted" />
                              </div>
                            </div>
                            <div className="text-lg font-semibold">
                              {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
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
                    ))}
                    
                    <div className="flex justify-end">
                      <button
                        className={`${isLoggedIn ? 'btn-primary' : 'btn-destructive'} flex items-center`}
                        onClick={() => handleBookNowGroup(group, false)}
                        disabled={tripType === 'round-trip' && bookingStep !== 'outbound'}
                      >
                        {!isLoggedIn && <AlertTriangle className="h-4 w-4 mr-1" />}
                        {isLoggedIn ? 'Book Now' : 'Login to Book'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Return Flights Section */}
              {results.flightBack && results.flightBack.results && results.flightBack.results.length > 0 && (
                <div id="return-flights-section">
                  <h3 className="font-semibold text-muted mt-8">Return flights</h3>
                  {results.flightBack.results.map((group, index) => (
                    <div key={`return-${index}`} className="card overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/5">
                        <span className="text-sm font-semibold">
                          {getFlightLegInfo(group)}
                        </span>
                        <div className="mt-1 text-sm text-muted">
                          {getGroupRouteText(group)}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {group.flights.map((flight: Flight) => (
                          <div key={flight.id} className="border p-3 rounded">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold">{flight.flightNumber || flight.airline?.name || 'Flight'}</span>
                              <span className="mx-2 text-muted">•</span>
                              {flight.detailsLoaded ? (
                                <span className="text-sm text-muted">
                                  {flight.origin?.city} {flight.origin?.code ? `(${flight.origin.code})` : ''} → {flight.destination?.city} {flight.destination?.code ? `(${flight.destination.code})` : ''}
                                </span>
                              ) : (
                                <span className="text-sm text-muted flex items-center">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Loading flight details...
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex items-center">
                                <div className="text-lg font-semibold">
                                  {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="mx-3 flex-1 border-t border-dashed border-muted relative" style={{ minWidth: '80px' }}>
                                  <div className="absolute -top-2 left-2">
                                    <Plane size={16} className="text-primary" />
                                  </div>
                                  <div className="absolute -top-2.5 right-2">
                                    <MapPin size={16} className="text-muted" />
                                  </div>
                                </div>
                                <div className="text-lg font-semibold">
                                  {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
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
                        ))}
                        
                        <div className="flex justify-end">
                          <button
                            className={`${isLoggedIn ? 'btn-primary' : 'btn-destructive'} flex items-center`}
                            onClick={() => handleBookNowGroup(group, true)}
                            disabled={tripType === 'round-trip' && bookingStep !== 'return'}
                          >
                            {!isLoggedIn && <AlertTriangle className="h-4 w-4 mr-1" />}
                            {isLoggedIn ? 'Book Now' : 'Login to Book'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
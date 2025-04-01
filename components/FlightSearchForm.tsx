'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    if (!origin || !destination || !departureDate) {
      setError('Please fill in origin, destination, and departure date.');
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
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          {/* Origin Input with Suggestions */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Origin (city or airport)"
              value={origin}
              onChange={handleOriginChange}
              className="input input-bordered w-full"
              required
            />
            {originSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                {originSuggestions.map((sugg, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
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
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Destination (city or airport)"
              value={destination}
              onChange={handleDestinationChange}
              className="input input-bordered w-full"
              required
            />
            {destinationSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                {destinationSuggestions.map((sugg, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
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
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="label">Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          {tripType === 'round-trip' && (
            <div className="flex-1">
              <label className="label">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <label className="cursor-pointer label">
            <span className="label-text mr-2">One-way</span>
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'one-way'}
              onChange={() => setTripType('one-way')}
              className="radio radio-primary"
            />
          </label>
          <label className="cursor-pointer label">
            <span className="label-text mr-2">Round-trip</span>
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'round-trip'}
              onChange={() => setTripType('round-trip')}
              className="radio radio-primary"
            />
          </label>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Search Flights
        </button>
      </form>

      {results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Flight Results</h2>
          {results.flightThere?.results?.length ? (
            <div className="space-y-4">
              {results.flightThere.results.map((group, index: number) => (
                <div key={index} className="border p-4 rounded">
                  <p className="font-bold">Flight Group {index + 1}</p>
                  {group.flights.map((flight: Flight) => (
                    <div key={flight.id} className="p-2 border-b last:border-0">
                      <p>Flight: {flight.flightNumber}</p>
                      <p>
                        Departure: {new Date(flight.departureTime).toLocaleString()}
                      </p>
                      <p>
                        Arrival: {new Date(flight.arrivalTime).toLocaleString()}
                      </p>
                      <p>Duration: {flight.duration} minutes</p>
                      <p>
                        Price: {flight.price} {flight.currency}
                      </p>
                      {flight.layovers && (
                        <p>Layovers: {JSON.stringify(flight.layovers)}</p>
                      )}
                      <button
                        className="btn btn-primary mt-2"
                        onClick={() =>
                          router.push(`/bookings?flightIds=${encodeURIComponent(flight.id)}`)
                        }
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p>No flights found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSearchForm;

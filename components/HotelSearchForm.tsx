'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OSMMap from './OSMMap';
import { Calendar, MapPin, Star, Search, Users } from 'lucide-react';

interface Hotel {
  id: number;
  name: string;
  logo?: string;
  address: string;
  location: string;
  starRating: number;
  startingPrice: number;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

interface SearchResults {
  results: Hotel[];
}

interface Suggestion {
  label: string;
  value: string;
}

interface HotelSearchFormProps {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialName?: string;
  initialStarRating?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  onSearch?: (
    city: string,
    checkIn: string,
    checkOut: string,
    name?: string,
    starRating?: string,
    minPrice?: string,
    maxPrice?: string
  ) => void;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  initialCity = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialName = '',
  initialStarRating = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  onSearch,
}) => {
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [nameFilter, setNameFilter] = useState(initialName);
  const [starRating, setStarRating] = useState(initialStarRating);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<Suggestion[]>([]);

  // Fetch city suggestions from the backend endpoint
  const fetchCitySuggestions = async (query: string): Promise<Suggestion[]> => {
    try {
      const citiesRes = await fetch('/api/cities');
      
      if (!citiesRes.ok) {
        console.error('Failed to fetch city suggestions.');
        return [];
      }
      
      const cities = await citiesRes.json();
      
      // Map cities to suggestion objects
      const suggestions: Suggestion[] = cities.map((c: any) => ({
        label: `${c.city}, ${c.country}`,
        value: c.city,
      }));
      
      // Filter suggestions based on the query
      return suggestions.filter((item: Suggestion) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      console.error('Error fetching city suggestions:', err);
      return [];
    }
  };

  // Handle city input change
  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    
    // Only fetch suggestions if there are at least 2 characters
    if (value.length >= 2) {
      const suggestions = await fetchCitySuggestions(value);
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    if (!city || !checkIn || !checkOut) {
      setError('City, check-in, and check-out dates are required.');
      return;
    }

    const params = new URLSearchParams();
    params.append('city', city);
    params.append('checkIn', checkIn);
    params.append('checkOut', checkOut);
    if (nameFilter) params.append('name', nameFilter);
    if (starRating) params.append('starRating', starRating);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    if (onSearch) {
      onSearch(city, checkIn, checkOut, nameFilter, starRating, minPrice, maxPrice);
    }

    try {
      const res = await fetch(`/api/hotels?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error fetching hotels');
      } else {
        const data = await res.json();
        setResults(data);
      }
    } catch (err: any) {
      setError('Error fetching hotels');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City input with autocomplete suggestions */}
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <MapPin className="h-5 w-5 text-muted" />
              </div>
              <input
                type="text"
                placeholder="Where are you going?"
                value={city}
                onChange={handleCityChange}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                style={{ paddingLeft: '2.5rem' }} /* Extra padding to ensure no overlap */
              />
              {citySuggestions.length > 0 && (
                <div className="absolute w-full" style={{ top: '100%', left: 0 }}>
                  <ul className="z-[9999] mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border w-full">
                    {citySuggestions.map((sugg, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-muted/10 cursor-pointer"
                        onClick={() => {
                          setCity(sugg.value);
                          setCitySuggestions([]);
                        }}
                      >
                        {sugg.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Check-in date input - Fixed icon positioning */}
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-muted" />
              </div>
              <input
                type="date"
                placeholder="Check-in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                style={{ paddingLeft: '2.5rem' }} /* Extra padding to ensure no overlap */
              />
            </div>
            
            {/* Check-out date input - Fixed icon positioning */}
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-muted" />
              </div>
              <input
                type="date"
                placeholder="Check-out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input input-bordered w-full pl-16 focus:pl-16"
                required
                style={{ paddingLeft: '2.5rem' }} /* Extra padding to ensure no overlap */
              />
            </div>
            
            <div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => setIsAdvancedSearch(!isAdvancedSearch)} 
              className="text-sm text-primary hover:underline"
            >
              {isAdvancedSearch ? 'Hide' : 'Show'} advanced search options
            </button>
          </div>
          
          {isAdvancedSearch && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border">
              <input
                type="text"
                placeholder="Hotel Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="input input-bordered w-full"
              />
              
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none z-10">
                  <Star className="h-5 w-5 text-muted" />
                </div>
                <select
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  className="input input-bordered w-full pl-16 focus:pl-16 appearance-none"
                  style={{ paddingLeft: '2.5rem' }} /* Extra padding to ensure no overlap */
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input input-bordered w-full"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mt-4">
              {error}
            </div>
          )}
        </form>
      </div>
      
      {/* Hotel search results section */}
      {results && (
        <div>
          <h2 className="text-xl font-bold mb-4">Hotel Results</h2>
          {results.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.results.map((hotel) => (
                <div key={hotel.id} className="card overflow-hidden transition-shadow hover:shadow-card">
                  <div className="relative h-48">
                    {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
                      <OSMMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} />
                    ) : (
                      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                        <p>No map available</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-card/90 px-2 py-1 rounded-md text-sm font-medium">
                      ${hotel.startingPrice}/night
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <p className="text-muted text-sm">{hotel.address}</p>
                        <p className="text-sm mt-1">{hotel.location}</p>
                      </div>
                      <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded">
                        <Star className="h-4 w-4 inline mr-1" />
                        <span className="font-medium">{hotel.starRating}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        href={`/hotels/${hotel.id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`}
                        className="btn-primary w-full block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-border rounded-lg">
              <p className="text-lg text-muted">No hotels found matching your criteria.</p>
              <p className="mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSearchForm;

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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted z-10">
                <MapPin className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Where are you going?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input input-bordered w-full pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted z-10">
                <Calendar className="h-5 w-5" />
              </div>
              <input
                type="date"
                placeholder="Check-in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input input-bordered w-full pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted z-10">
                <Calendar className="h-5 w-5" />
              </div>
              <input
                type="date"
                placeholder="Check-out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input input-bordered w-full pl-10"
                required
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
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted z-10">
                  <Star className="h-5 w-5" />
                </div>
                <select
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  className="input input-bordered w-full pl-10 appearance-none"
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
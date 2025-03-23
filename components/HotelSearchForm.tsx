'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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

const HotelSearchForm: React.FC = () => {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [starRating, setStarRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <input
            type="date"
            placeholder="Check-in"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <input
            type="date"
            placeholder="Check-out"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Hotel Name (optional)"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="input input-bordered w-full"
          />
          <input
            type="number"
            placeholder="Star Rating (optional)"
            value={starRating}
            onChange={(e) => setStarRating(e.target.value)}
            className="input input-bordered w-full"
          />
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
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="btn btn-primary">Search Hotels</button>
      </form>
      {results && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Hotel Results</h2>
          {results.results.length > 0 ? (
            <div className="space-y-4">
              {results.results.map((hotel) => (
                <div key={hotel.id} className="border p-4 rounded flex flex-col md:flex-row items-center">
                  <img
                    src={hotel.logo || '/default-hotel.png'}
                    alt={hotel.name}
                    className="w-24 h-24 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{hotel.name}</h3>
                    <p>{hotel.address}</p>
                    <p>Star Rating: {hotel.starRating}</p>
                    <p>Starting Price: {hotel.startingPrice}</p>
                    {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
                      <p>
                        Location: ({hotel.coordinates.lat.toFixed(2)},{' '}
                        {hotel.coordinates.lng.toFixed(2)})
                      </p>
                    ) : (
                      <p>No map data</p>
                    )}
                  </div>
                  <div>
                    <Link href={`/hotels/${hotel.id}`}>
                      <button className="btn btn-secondary">View Details</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hotels found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSearchForm;

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Hotel {
  id: number;
  name: string;
  address: string;
  location: string;
  starRating: number;
}

export default function HotelManagementDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // Endpoint that returns hotels owned by the current user.
        const res = await fetch('/api/hotels/owner', { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch hotels');
        } else {
          const data = await res.json();
          setHotels(data);
        }
      } catch (err: any) {
        setError('Error fetching hotels');
      }
    };
    fetchHotels();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hotel Management Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {hotels.length === 0 ? (
        <p>
          You don't own any hotels yet.{' '}
          <Link href="/hotels/add" className="text-blue-500 underline">
            Add a hotel
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="border p-4 rounded">
              <h2 className="text-2xl font-semibold">{hotel.name}</h2>
              <p>{hotel.address}</p>
              <p>{hotel.location}</p>
              <p>Star Rating: {hotel.starRating}</p>
              <div className="flex flex-wrap gap-4 mt-2">
                <Link href={`/hotels/${hotel.id}/edit`} className="btn btn-secondary">
                  Edit Hotel
                </Link>
                <Link href={`/hotels/${hotel.id}/rooms/add`} className="btn btn-secondary">
                  Add Room Type
                </Link>
                <Link href={`/hotels/${hotel.id}/availability`} className="btn btn-secondary">
                  View/Update Availability
                </Link>
                <Link href={`/bookings/manage?hotelId=${hotel.id}`} className="btn btn-secondary">
                  Manage Bookings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

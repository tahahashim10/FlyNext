'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OSMMap from '../../../components/OSMMap';

interface HotelDetail {
  id: number;
  name: string;
  logo?: string;
  address: string;
  location: string;
  starRating: number;
  images: string[];
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  rooms: RoomType[];
}

interface RoomType {
  id: number;
  type: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  availableRooms: number;
}

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params?.id;
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotelId) return;
    const fetchHotelDetail = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Error fetching hotel details');
        } else {
          const data = await res.json();
          setHotel(data);
        }
      } catch (err: any) {
        setError('Error fetching hotel details');
      }
    };

    fetchHotelDetail();
  }, [hotelId]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!hotel) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row">
        <img
          src={hotel.logo || '/default-hotel.png'}
          alt={hotel.name}
          className="w-full md:w-1/3 object-cover rounded"
        />
        <div className="md:ml-4 flex-1">
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <p>{hotel.address}</p>
          <p>Location: {hotel.location}</p>
          <p>Star Rating: {hotel.starRating}</p>
          {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
            <div className="mt-4">
              <OSMMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} />
            </div>
          ) : (
            <p>No map data available.</p>
          )}
          <div className="mt-4">
            <Link href={`/hotels/${hotel.id}/rooms`}>
              <button className="btn btn-primary">Check Room Availability</button>
            </Link>
          </div>
        </div>
      </div>
      {/* Gallery and room details as before */}
    </div>
  );
}

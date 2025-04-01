'use client';

import { useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const hotelId = params?.id;
  // Read checkIn and checkOut from the query parameters
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';

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
      <div className="flex flex-col md:flex-row gap-4">
        <img
          src={hotel.logo || '/default-hotel.png'}
          alt={hotel.name}
          className="w-full md:w-1/3 object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <p>{hotel.address}</p>
          <p>Location: {hotel.location}</p>
          <p>Star Rating: {hotel.starRating}</p>
          {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
            <div className="mt-4 w-full h-64 overflow-hidden">
              <OSMMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} />
            </div>
          ) : (
            <p>No map available.</p>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {hotel.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${hotel.name} ${idx + 1}`}
              className="w-48 h-32 object-cover rounded"
            />
          ))}
        </div>
      </div>

      {/* Room Types & Amenities */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Room Types & Amenities</h2>
        {hotel.rooms.length > 0 ? (
          <div className="space-y-4">
            {hotel.rooms.map((room) => (
              <div key={room.id} className="border p-4 rounded">
                <h3 className="text-xl font-bold">{room.type}</h3>
                <p>Price Per Night: ${room.pricePerNight}</p>
                <p>Available Rooms: {room.availableRooms}</p>
                <p>Amenities: {room.amenities.join(', ')}</p>
                <div className="flex space-x-2 mt-2">
                  {room.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${room.type} ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
                {/* "Book Now" Button with pre-populated checkIn and checkOut */}
                <div className="mt-4">
                  <Link
                    href={`/bookings?hotelId=${hotel.id}&roomId=${room.id}&checkIn=${encodeURIComponent(preCheckIn)}&checkOut=${encodeURIComponent(preCheckOut)}`}
                  >
                    <button className="btn btn-primary">Book Now</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No room types available.</p>
        )}
      </div>
    </div>
  );
}

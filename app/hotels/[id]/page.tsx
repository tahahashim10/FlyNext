
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OSMMap from '../../../components/OSMMap';
import { MapPin, Star, Calendar, Wifi, Tv, Coffee, Utensils } from 'lucide-react';

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

// Helper function to render amenity icons
const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();
  if (lowerAmenity.includes('wifi')) return <Wifi className="h-4 w-4" />;
  if (lowerAmenity.includes('tv')) return <Tv className="h-4 w-4" />;
  if (lowerAmenity.includes('breakfast')) return <Coffee className="h-4 w-4" />;
  if (lowerAmenity.includes('restaurant')) return <Utensils className="h-4 w-4" />;
  return null;
};

export default function HotelDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params?.id;
  // Read checkIn and checkOut from the query parameters
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hotel Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          {hotel.logo ? (
            <img
              src={hotel.logo}
              alt={hotel.name}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <span className="text-lg text-muted">No logo available</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              
              <div className="flex items-center gap-1 text-primary mt-2">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
                <span className="text-sm ml-1">({hotel.starRating}-star hotel)</span>
              </div>
              
              <div className="flex items-start mt-3">
                <MapPin className="h-5 w-5 text-muted mt-0.5 mr-1 flex-shrink-0" />
                <div>
                  <p className="text-foreground">{hotel.address}</p>
                  <p className="text-muted text-sm">{hotel.location}</p>
                </div>
              </div>
            </div>
            
            {/* Check-in/Check-out details if available */}
            {(preCheckIn || preCheckOut) && (
              <div className="bg-muted/10 p-3 rounded-lg border border-border hidden md:block">
                {preCheckIn && (
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Check-in: {preCheckIn}</span>
                  </div>
                )}
                {preCheckOut && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Check-out: {preCheckOut}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Map */}
          {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
            <div className="mt-4 h-52 rounded-lg overflow-hidden border border-border">
              <OSMMap lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} />
            </div>
          ) : (
            <p className="mt-4 p-4 bg-muted/10 rounded-lg text-center text-muted">No map available.</p>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">Gallery</h2>
        {hotel.images.length > 0 ? (
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={hotel.images[activeImageIndex]}
                alt={`${hotel.name} view ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {hotel.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`cursor-pointer flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${hotel.name} thumbnail ${idx + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted">No gallery images available.</p>
        )}
      </div>

      {/* Room Types & Amenities */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">Room Types & Amenities</h2>
        {hotel.rooms.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hotel.rooms.map((room) => (
              <div key={room.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-card transition-all">
                {/* Room images carousel */}
                {room.images.length > 0 && (
                  <div className="relative h-48 bg-muted/10">
                    <img
                      src={room.images[0]}
                      alt={`${room.type} view`}
                      className="w-full h-full object-cover"
                    />
                    {room.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                        +{room.images.length - 1} more photos
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{room.type}</h3>
                    <div className="text-lg font-semibold text-primary">
                      ${room.pricePerNight}<span className="text-sm text-muted">/night</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-muted">
                    <span className={room.availableRooms > 3 ? "text-green-600" : "text-amber-600"}>
                      {room.availableRooms} {room.availableRooms === 1 ? 'room' : 'rooms'} available
                    </span>
                    {room.availableRooms <= 3 && (
                      <span className="ml-2 text-amber-600 text-xs">
                        (only {room.availableRooms} left!)
                      </span>
                    )}
                  </div>
                  
                  {/* Room amenities */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center bg-muted/10 px-2 py-1 rounded text-xs"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Book Now button */}
                  <div className="mt-4">
                    <Link
                      href={`/bookings?hotelId=${hotel.id}&roomId=${room.id}&checkIn=${encodeURIComponent(preCheckIn)}&checkOut=${encodeURIComponent(preCheckOut)}`}
                    >
                      <button className="btn-primary w-full flex items-center justify-center">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted p-4 bg-muted/5 rounded-lg text-center">No room types available.</p>
        )}
      </div>
    </div>
  );
}
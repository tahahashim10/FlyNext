'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OSMMap from '../../../components/OSMMap';
import { 
  MapPin, Star, Calendar, Wifi, Tv, Coffee, Utensils, 
  CalendarDays, Search, ArrowRight
} from 'lucide-react';
import Modal from '../../../components/Modal';
import RoomAvailability from '../../../components/RoomAvailability';
import RoomImageCarousel from '../../../components/RoomImageCarousel';
import HotelLogo from '../../../components/HotelLogo';

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
  const router = useRouter();
  const hotelId = params?.id;
  
  // Read checkIn and checkOut from the query parameters
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  // Add animation CSS for modal
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes modalIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-modal-in {
        animation: modalIn 0.2s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  const handleCheckAvailability = () => {
    // Open availability modal
    setIsAvailabilityModalOpen(true);
  };

  const goToAvailabilityPage = () => {
    router.push(`/hotels/${hotelId}/rooms${preCheckIn && preCheckOut ? `?checkIn=${preCheckIn}&checkOut=${preCheckOut}` : ''}`);
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!hotel) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hotel Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          <HotelLogo logo={hotel.logo} name={hotel.name} />
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
                
                {/* Check Availability button */}
                <button 
                  onClick={handleCheckAvailability}
                  className="mt-3 flex items-center justify-center w-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1.5 px-2 rounded"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Check Room Availability
                </button>
              </div>
            )}
          </div>
          
          {/* Check Availability Section (shown when no dates are provided) */}
          {(!preCheckIn || !preCheckOut) && (
            <div className="mt-4 p-4 bg-muted/10 border border-border rounded-lg">
              <div className="flex items-center text-foreground font-medium mb-2">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Looking for available rooms?
              </div>
              <p className="text-sm text-muted mb-3">
                Check room availability for your travel dates
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCheckAvailability}
                  className="btn-primary text-sm flex items-center"
                >
                  Quick Check
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
                <button
                  onClick={goToAvailabilityPage}
                  className="btn-outline text-sm"
                >
                  Advanced Search
                </button>
              </div>
            </div>
          )}
          
          {/* Map */}
          {hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng ? (
            <div 
              className="mt-4 h-72 w-full rounded-lg overflow-hidden border border-border"
              style={{ position: 'relative', zIndex: 1 }}
            >
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
                <RoomImageCarousel images={room.images} roomName={room.type} />
                
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
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex space-x-2">
                    {/* Book Now button */}
                    <Link
                      href={`/bookings?hotelId=${hotel.id}&roomId=${room.id}&checkIn=${encodeURIComponent(preCheckIn)}&checkOut=${encodeURIComponent(preCheckOut)}`}
                      className="flex-1"
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
      
      {/* Availability Modal */}
      <Modal 
        isOpen={isAvailabilityModalOpen} 
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Room Availability"
        size="lg"
      >
        <RoomAvailability 
          hotelId={hotelId} 
          initialCheckIn={preCheckIn}
          initialCheckOut={preCheckOut}
          isDialog={true}
        />
      </Modal>
    </div>
  );
}
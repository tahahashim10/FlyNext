'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface RoomType {
  id: number;
  name: string;
  remainingRooms: number;
  totalAvailableRooms: number;
  pricePerNight: number;
  amenities: string[];
  type?: string; // For compatibility with hotel detail page
  images?: string[];
  availableRooms?: number;
}

interface RoomAvailabilityProps {
  hotelId: string | string[] | undefined;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onBackToHotel?: () => void;
  isDialog?: boolean;
}

export default function RoomAvailability({
  hotelId,
  initialCheckIn = '',
  initialCheckOut = '',
  onBackToHotel,
  isDialog = false
}: RoomAvailabilityProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hotelName, setHotelName] = useState<string>('');

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  // Fetch hotel name when component mounts
  useEffect(() => {
    const fetchHotelName = async () => {
      try {
        if (!hotelId) return;
        
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (res.ok) {
          const data = await res.json();
          setHotelName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch hotel name:", error);
      }
    };

    fetchHotelName();
  }, [hotelId]);

  const fetchAvailability = async () => {
    if (!checkIn || !checkOut || !hotelId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/hotels/${hotelId}/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error fetching availability');
      } else {
        const data = await res.json();

        // If data is an array, use it directly.
        if (Array.isArray(data)) {
          setRooms(data);
        }
        // If data.results exists and is an array, use that.
        else if (data.results && Array.isArray(data.results)) {
          setRooms(data.results);
        }
        else {
          setError('Unexpected response format');
        }
      }
    } catch (err: any) {
      setError('Error fetching availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchAvailability();
  };

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div className={`bg-background ${isDialog ? '' : 'min-h-screen'} p-4 max-w-3xl mx-auto`}>
      {!isDialog && onBackToHotel && (
        <button 
          onClick={onBackToHotel}
          className="flex items-center text-primary hover:text-primary/80 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {hotelName || 'Hotel'} Details
        </button>
      )}
      
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
          <h2 className="text-xl font-bold">Check Room Availability</h2>
          {hotelName && <p className="text-sm text-muted">for {hotelName}</p>}
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <label className="text-sm font-medium text-muted mb-1 block flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Check-in Date
                </label>
                <div className="relative">
                    <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2 rounded-md border border-border bg-background dark:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground dark:text-foreground appearance-none"
                    required
                    />
                    <Calendar className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted" />
                </div>
                </div>
                <div className="flex-1">
                <label className="text-sm font-medium text-muted mb-1 block flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Check-out Date
                </label>
                <div className="relative">
                    <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2 rounded-md border border-border bg-background dark:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground dark:text-foreground appearance-none"
                    required
                    />
                    <Calendar className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted" />
                </div>
                </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary flex items-center justify-center w-full h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Availability...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Check Availability
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {rooms.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                Available Rooms
                {nights > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    for {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                )}
              </h3>
              
              <div className="divide-y divide-border">
                {rooms.map((room) => (
                  <div key={room.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{room.name || room.type}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            ${room.pricePerNight} per night
                          </span>
                          <span className="text-sm text-muted">
                            {room.remainingRooms || room.availableRooms || 0} available
                          </span>
                        </div>
                      </div>
                      
                      <a 
                        href={`/bookings?hotelId=${hotelId}&roomId=${room.id}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`}
                        className="btn-outline text-sm"
                      >
                        Book Now
                      </a>
                    </div>
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-muted mb-1 block">Amenities:</span>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <span key={index} className="text-xs bg-muted/20 px-2 py-0.5 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
              <p className="mt-2 text-muted">Checking room availability...</p>
            </div>
          ) : (
            <div className="text-center py-6 text-muted">
              {checkIn && checkOut ? (
                <p>No available rooms found for the selected dates. Try different dates.</p>
              ) : (
                <p>Select dates to check room availability.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
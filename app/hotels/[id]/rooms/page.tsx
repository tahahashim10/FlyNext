'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import RoomAvailability from '@/components/RoomAvailability';

export default function RoomAvailabilityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hotelId = params?.id; // hotel id from URL
  
  // Get check-in and check-out from query parameters
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  // Handler to navigate back to the hotel detail page
  const handleBackToHotel = () => {
    router.push(`/hotels/${hotelId}${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''}`);
  };

  return (
    <RoomAvailability 
      hotelId={hotelId} 
      initialCheckIn={checkIn}
      initialCheckOut={checkOut}
      onBackToHotel={handleBackToHotel}
    />
  );
}
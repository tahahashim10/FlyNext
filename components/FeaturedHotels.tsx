'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

interface Hotel {
  id: number;
  name: string;
  logo: string;
  address: string;
  location: string;
  starRating: number;
  startingPrice: number;
  images?: string[];
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

interface FeaturedHotelsProps {
  title?: string;
}

const FeaturedHotels: React.FC<FeaturedHotelsProps> = ({ 
  title = "Top Rated Hotels" 
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        // Fetch from the dedicated endpoint for home display
        const response = await fetch('/api/hotels/homeDisplay');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hotels');
        }

        const data = await response.json();
        
        // The API now includes images in the response
        setHotels(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Render loading indicators
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden h-64 bg-muted/20 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Function to render star rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={i < rating ? 'currentColor' : 'none'}
        stroke={i < rating ? 'currentColor' : 'currentColor'}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ));
  };

  // Render error message
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load featured hotels. Please try again later.</p>
      </div>
    );
  }

  // Show message if no hotels are available
  if (hotels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">No featured hotels available at the moment.</p>
      </div>
    );
  }

  // Get the hotel image to display (first gallery image, logo, or fallback)
  const getHotelImage = (hotel: Hotel) => {
    // First priority: use the first image from the hotel's gallery if available
    if (hotel.images && hotel.images.length > 0) {
      return hotel.images[0];
    }
    // Second priority: use the logo if it's a regular image URL
    else if (hotel.logo && !hotel.logo.startsWith('data:image/svg')) {
      return hotel.logo;
    }
    // No suitable image available
    return null;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {hotels.map((hotel) => {
        const hotelImage = getHotelImage(hotel);
        
        return (
          <div 
            key={hotel.id}
            className="group relative hover-trigger"
          >
            <div className="relative rounded-lg overflow-hidden h-64 shadow-md transition-all duration-300 group-hover:shadow-xl transform group-hover:-translate-y-1">
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              
              {/* Hotel image as background with fallback */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10">
                {hotelImage ? (
                  <img 
                    src={hotelImage} 
                    alt={`${hotel.name}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // On error, show a fallback gradient
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  // If no image available, show a nice gradient with the first letter
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">{hotel.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Hotel details - the part that's always visible */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                <div className="flex items-center mb-1 space-x-1">
                  {renderStars(hotel.starRating)}
                </div>
                <h3 className="font-semibold text-lg group-hover:text-primary-foreground transition-colors">{hotel.name}</h3>
                <p className="text-sm text-white/90">{hotel.location}</p>
                {hotel.startingPrice && (
                  <p className="text-sm font-medium mt-1">
                    From <span className="text-primary-foreground">${hotel.startingPrice}</span> per night
                  </p>
                )}
              </div>
              
            {/* The content that appears on hover for non-authenticated users */}
              {!user && (
                <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center z-50">
                    <div className="bg-white/10 p-3 rounded-full mb-3 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform translate-y-4 group-hover:translate-y-0">
                      <LogIn className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-center font-medium mb-4 text-white max-w-[80%] opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 transform translate-y-4 group-hover:translate-y-0">
                      View hotel details and make bookings
                    </p>
                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform translate-y-4 group-hover:translate-y-0">
                      <Link 
                        href="/login" 
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup" 
                        className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-4 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Card link - only for authenticated users */}
            {user && (
              <Link 
                href={`/hotels/${hotel.id}`}
                className="absolute inset-0 z-10"
                aria-label={`View details for ${hotel.name}`}
              ></Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeaturedHotels;
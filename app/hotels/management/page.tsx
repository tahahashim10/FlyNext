'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Hotel, 
  PlusCircle, 
  Edit, 
  Key, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  PlusSquare, 
  List, 
  Star 
} from 'lucide-react';

interface Hotel {
  id: number;
  name: string;
  address: string;
  location: string;
  starRating: number;
  logo?: string;
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-bold">Hotel Management Dashboard</h1>
                <Link href="/hotels/add" className="btn btn-primary flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add Hotel
                </Link>
              </div>
              <p className="mt-4 text-lg max-w-2xl">
                Manage and overview your hotels, rooms, and bookings in one place.
              </p>
            </div>
          </div>

          {/* Error handling */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {hotels.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Hotel className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Hotels Yet</h2>
              <p className="text-muted mb-6">
                Start your hospitality journey by adding your first hotel.
              </p>
              <Link href="/hotels/add" className="btn btn-primary">
                Add Your First Hotel
              </Link>
            </div>
          )}

          {/* Hotels Grid */}
          {hotels.length > 0 && (
            <div className="grid md:grid-cols-1 gap-6">
              {hotels.map((hotel) => (
                <div 
                  key={hotel.id} 
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Hotel Logo/Cover */}
                    <div className="md:w-1/4 h-48 md:h-auto bg-muted/10 flex items-center justify-center">
                      {hotel.logo ? (
                        <img 
                          src={hotel.logo} 
                          alt={`${hotel.name} logo`} 
                          className="max-h-full max-w-full object-contain" 
                        />
                      ) : (
                        <Hotel className="h-16 w-16 text-primary" />
                      )}
                    </div>

                    {/* Hotel Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-semibold mb-2">{hotel.name}</h2>
                          <p className="text-muted mb-1">{hotel.address}</p>
                          <p className="text-muted text-sm">{hotel.location}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: hotel.starRating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary" />
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 mt-6">
                        <Link 
                          href={`/hotels/${hotel.id}/edit`} 
                          className="btn btn-ghost btn-sm flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit Hotel
                        </Link>
                        <Link 
                          href={`/hotels/${hotel.id}/rooms/add`} 
                          className="btn btn-ghost btn-sm flex items-center justify-center"
                        >
                          <PlusSquare className="h-4 w-4 mr-1" /> Add Room
                        </Link>
                        <Link 
                          href={`/hotels/${hotel.id}/roomTypes`} 
                          className="btn btn-ghost btn-sm flex items-center justify-center"
                        >
                          <List className="h-4 w-4 mr-1" /> Manage Rooms
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Link 
                          href={`/hotels/${hotel.id}/availability`} 
                          className="btn btn-ghost btn-sm flex items-center justify-center"
                        >
                          <Calendar className="h-4 w-4 mr-1" /> Availability
                        </Link>
                        <Link 
                          href={`/bookings/manage?hotelId=${hotel.id}`} 
                          className="btn btn-ghost btn-sm flex items-center justify-center"
                        >
                          <BookOpen className="h-4 w-4 mr-1" /> Manage Bookings
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
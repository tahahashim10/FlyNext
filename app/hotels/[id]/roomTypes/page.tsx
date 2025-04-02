'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircle, 
  Edit, 
  Bed, 
  DollarSign, 
  Key, 
  AlertCircle 
} from 'lucide-react';

interface RoomType {
  id: number;
  name: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  availableRooms: number;
}

export default function RoomTypesListPage() {
  // Use the [id] segment as the hotelId.
  const { id } = useParams();
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchRoomTypes = async () => {
      try {
        // Note: We use "hotelId" as the query parameter
        const res = await fetch(`/api/roomTypes/owner?hotelId=${id}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch room types');
        } else {
          const data = await res.json();
          setRoomTypes(data);
        }
      } catch (err: any) {
        setError('Error fetching room types');
      }
    };
    fetchRoomTypes();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Manage Room Types</h1>
                <p className="mt-4 text-lg max-w-2xl">
                  View and manage room types for your hotel
                </p>
              </div>
              <Link 
                href={`/hotels/${id}/rooms/add`} 
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Add Room Type
              </Link>
            </div>
          </div>

          {/* Error Handling */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {roomTypes.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Bed className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Room Types Yet</h2>
              <p className="text-muted mb-6">
                Start by adding your first room type for this hotel.
              </p>
              <Link 
                href={`/hotels/${id}/rooms/add`} 
                className="btn btn-primary"
              >
                Add First Room Type
              </Link>
            </div>
          )}

          {/* Room Types Grid */}
          {roomTypes.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {roomTypes.map((room) => (
                <div 
                  key={room.id} 
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow"
                >
                  {/* Room Image */}
                  <div className="h-48 bg-muted/10 flex items-center justify-center">
                    {room.images.length > 0 ? (
                      <img 
                        src={room.images[0]} 
                        alt={`${room.name} room`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Bed className="h-16 w-16 text-primary" />
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-semibold">{room.name}</h2>
                      <div className="text-lg font-semibold text-primary">
                        ${room.pricePerNight}<span className="text-sm text-muted">/night</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-2">Amenities:</h3>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, idx) => (
                          <span 
                            key={idx} 
                            className="bg-muted/10 px-2 py-1 rounded text-xs flex items-center"
                          >
                            <Key className="h-3 w-3 mr-1 text-primary" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`text-sm ${room.availableRooms > 3 ? 'text-green-600' : 'text-amber-600'}`}>
                          {room.availableRooms} {room.availableRooms === 1 ? 'room' : 'rooms'} available
                        </span>
                        {room.availableRooms <= 3 && (
                          <span className="ml-2 text-amber-600 text-xs">
                            (only {room.availableRooms} left!)
                          </span>
                        )}
                      </div>
                      
                      {/* Edit Button */}
                      <Link 
                        href={`/hotels/${id}/roomTypes/${room.id}/edit`} 
                        className="btn btn-ghost btn-sm flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Link>
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
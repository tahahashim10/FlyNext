'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Bed, 
  DollarSign 
} from 'lucide-react';

interface Room {
  id: number;
  name?: string;
  type?: string;
  availableRooms: number;
  remainingRooms?: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

interface Hotel {
  id: number;
  name: string;
  rooms: Room[];
}

export default function AvailabilityPage() {
  const { id: hotelId } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkDates, setCheckDates] = useState({ checkIn: '', checkOut: '' });
  const [availabilityResult, setAvailabilityResult] = useState<Room[] | null>(null);
  const [updateValues, setUpdateValues] = useState<Record<number, string>>({});

  // Fetch hotel details to get room types and total available rooms.
  useEffect(() => {
    if (!hotelId) return;
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch hotel details');
        } else {
          const data = await res.json();
          setHotel(data);
        }
      } catch (err: any) {
        setError('Error fetching hotel details');
      }
    };
    fetchHotel();
  }, [hotelId]);

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckDates({ ...checkDates, [e.target.name]: e.target.value });
  };

  const checkAvailability = async () => {
    setError('');
    setSuccess('');
    setAvailabilityResult(null);
    if (!checkDates.checkIn || !checkDates.checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    try {
      const res = await fetch(
        `/api/hotels/${hotelId}/rooms?checkIn=${checkDates.checkIn}&checkOut=${checkDates.checkOut}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to check availability');
      } else {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          setAvailabilityResult(data.results);
          setSuccess('Availability fetched successfully.');
        } else {
          setError('Unexpected response format');
        }
      }
    } catch (err: any) {
      setError('Error checking availability');
    }
  };

  const handleUpdateChange = (roomId: number, value: string) => {
    setUpdateValues({ ...updateValues, [roomId]: value });
  };

  const updateAvailability = async (roomId: number) => {
    setError('');
    setSuccess('');
    try {
      const newValue = Number(updateValues[roomId]);
      const res = await fetch(`/api/hotels/availability/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableRooms: newValue }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update availability');
      } else {
        const data = await res.json();
        if (hotel) {
          const updatedRooms = hotel.rooms.map(room =>
            room.id === roomId ? { ...room, availableRooms: data.room.availableRooms } : room
          );
          setHotel({ ...hotel, rooms: updatedRooms });
          const roomName =
            hotel.rooms.find(r => r.id === roomId)?.name ||
            hotel.rooms.find(r => r.id === roomId)?.type ||
            'this room';
          setSuccess(`Availability for room "${roomName}" updated successfully.`);
        }
      }
    } catch (err: any) {
      setError('Error updating availability');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">Room Availability</h1>
              <p className="mt-4 text-lg max-w-2xl">
                Check and manage room availability for your hotel
              </p>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
              <p>{success}</p>
            </div>
          )}

          {/* Check Availability Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="h-6 w-6 mr-2 text-primary" />
              Check Room Availability
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block mb-2 font-semibold">Check-in Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <input
                    type="date"
                    name="checkIn"
                    value={checkDates.checkIn}
                    onChange={handleCheckChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block mb-2 font-semibold">Check-out Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <input
                    type="date"
                    name="checkOut"
                    value={checkDates.checkOut}
                    onChange={handleCheckChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={checkAvailability} 
                  className="btn btn-primary flex items-center"
                >
                  <Search className="h-5 w-5 mr-2" /> Check Availability
                </button>
              </div>
            </div>

            {/* Availability Results */}
            {availabilityResult && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Availability Results</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {availabilityResult.map((room: Room) => {
                    const displayName = room.name || room.type || 'Unnamed Room';
                    return (
                      <div 
                        key={room.id} 
                        className="bg-background border border-border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-lg font-bold">{displayName}</h5>
                          <div className="flex items-center text-primary">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-semibold">{room.pricePerNight}/night</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted mb-2">
                          <p>
                            Available Rooms: {' '}
                            <span className={`font-semibold ${
                              (room.remainingRooms || 0) > 3 
                                ? 'text-green-600' 
                                : 'text-amber-600'
                            }`}>
                              {room.remainingRooms !== undefined ? room.remainingRooms : 'N/A'}
                            </span>
                          </p>
                        </div>
                        <div className="text-sm text-muted">
                          <p>Amenities: {room.amenities.join(', ')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Update Availability Section */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <RefreshCw className="h-6 w-6 mr-2 text-primary" />
              Update Room Availability
            </h3>
            {hotel ? (
              <div className="space-y-4">
                {hotel.rooms.map(room => {
                  const displayName = room.name || room.type || 'Unnamed Room';
                  return (
                    <div 
                      key={room.id} 
                      className="bg-background border border-border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between"
                    >
                      <div className="mb-2 md:mb-0">
                        <h4 className="text-lg font-bold">{displayName}</h4>
                        <p className="text-sm text-muted">
                          Current Available Rooms: {room.availableRooms}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="New Rooms"
                          value={updateValues[room.id] || ''}
                          onChange={(e) => handleUpdateChange(room.id, e.target.value)}
                          className="input input-bordered w-24"
                        />
                        <button 
                          onClick={() => updateAvailability(room.id)} 
                          className="btn btn-primary btn-sm"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <Bed className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="text-muted">Loading room types...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
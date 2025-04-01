'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Room Types for Hotel {id}</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {roomTypes.length === 0 ? (
        <p>
          No room types found.{' '}
          <Link href={`/hotels/${id}/rooms/add`} className="text-blue-500 underline">
            Add one
          </Link>.
        </p>
      ) : (
        <div className="space-y-4">
          {roomTypes.map((room) => (
            <div key={room.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{room.name}</h2>
                <p>Amenities: {room.amenities.join(', ')}</p>
                <p>Price Per Night: ${room.pricePerNight}</p>
                <p>Available Rooms: {room.availableRooms}</p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/hotels/${id}/roomTypes/${room.id}/edit`} className="btn btn-secondary">
                  Edit
                </Link>
                {/* You can add a Delete button here if desired */}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Link href={`/hotels/${id}/rooms/add`} className="btn btn-primary">
          Add New Room Type
        </Link>
      </div>
    </div>
  );
}

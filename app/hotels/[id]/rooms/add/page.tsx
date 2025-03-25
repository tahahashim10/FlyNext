'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function AddRoomTypePage() {
  const { id: hotelId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    amenities: '',
    pricePerNight: '',
    images: '',
    availableRooms: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const payload = {
      hotelId: Number(hotelId),
      name: formData.name,
      amenities: formData.amenities.split(',').map(item => item.trim()).filter(Boolean),
      pricePerNight: Number(formData.pricePerNight),
      images: formData.images.split(',').map(item => item.trim()).filter(Boolean),
      availableRooms: Number(formData.availableRooms)
    };
    
    try {
      const res = await fetch('/api/roomTypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add room type');
      } else {
        setSuccess('Room type added successfully!');
        // Clear the form
        setFormData({
          name: '',
          amenities: '',
          pricePerNight: '',
          images: '',
          availableRooms: ''
        });
      }
    } catch (err: any) {
      setError('Error submitting form');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add Room Type</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Room Name (e.g. Twin, Double)"
          value={formData.name}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          name="amenities"
          placeholder="Amenities (comma separated)"
          value={formData.amenities}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="pricePerNight"
          placeholder="Price Per Night"
          value={formData.pricePerNight}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          name="images"
          placeholder="Image URLs (comma separated)"
          value={formData.images}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="availableRooms"
          placeholder="Total Available Rooms"
          value={formData.availableRooms}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Add Room Type
        </button>
      </form>
    </div>
  );
}

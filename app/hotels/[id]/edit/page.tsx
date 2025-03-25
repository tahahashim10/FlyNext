'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Hotel {
  id: number;
  name: string;
  logo: string;
  address: string;
  location: string;
  starRating: number;
  images: string[];
}

export default function EditHotelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    location: '',
    starRating: '',
    images: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch hotel details');
        } else {
          const data = await res.json();
          setHotel(data);
          setFormData({
            name: data.name || '',
            logo: data.logo || '',
            address: data.address || '',
            location: data.location || '',
            starRating: data.starRating?.toString() || '',
            images: data.images?.join(', ') || ''
          });
        }
      } catch (err: any) {
        setError('Error fetching hotel details');
      }
    };
    fetchHotel();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      name: formData.name,
      logo: formData.logo,
      address: formData.address,
      location: formData.location,
      starRating: Number(formData.starRating),
      images: formData.images.split(',').map((img: string) => img.trim()).filter(Boolean)
    };
    try {
      const res = await fetch(`/api/hotels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update hotel');
      } else {
        setSuccess('Hotel updated successfully');
        // Optionally, refresh hotel details
      }
    } catch (err: any) {
      setError('Error updating hotel');
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete hotel');
      } else {
        setSuccess('Hotel deleted successfully');
        router.push('/hotels/management');
      }
    } catch (err: any) {
      setError('Error deleting hotel');
    }
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!hotel) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Hotel</h2>
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Hotel Name"
          value={formData.name}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="url"
          name="logo"
          placeholder="Logo URL"
          value={formData.logo}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location/City"
          value={formData.location}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="number"
          name="starRating"
          placeholder="Star Rating"
          value={formData.starRating}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
          min="0"
          max="5"
        />
        <input
          type="text"
          name="images"
          placeholder="Image URLs (comma separated)"
          value={formData.images}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary w-full">Update Hotel</button>
      </form>
      <button onClick={handleDelete} className="btn btn-danger w-full mt-4">
        Delete Hotel
      </button>
    </div>
  );
}

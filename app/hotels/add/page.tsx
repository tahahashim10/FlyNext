'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddHotelPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    location: '',
    starRating: '',
    images: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: formData.name,
      logo: formData.logo,
      address: formData.address,
      location: formData.location,
      starRating: Number(formData.starRating),
      images: formData.images.split(',').map(img => img.trim()).filter(Boolean)
    };
    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add hotel');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError('Error submitting form');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add Your Hotel</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <textarea
          name="images"
          placeholder="Image URLs (comma separated)"
          value={formData.images}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
        />
        <button type="submit" className="btn btn-primary w-full">Add Hotel</button>
      </form>
    </div>
  );
}

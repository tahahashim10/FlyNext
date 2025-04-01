'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { uploadImage } from '@/utils/uploadImage';

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
    logo: '', // holds the uploaded logo URL
    address: '',
    location: '',
    starRating: '',
    images: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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
            images: data.images || [],
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

  // Handler for logo upload
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingLogo(true);
      try {
        const file = e.target.files[0];
        const uploadedUrl = await uploadImage(file);
        setFormData((prev) => ({ ...prev, logo: uploadedUrl }));
      } catch (err: any) {
        console.error('Error uploading logo:', err);
        setError('Failed to upload logo.');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  // Handler to upload additional images (max 5 total)
  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const currentCount = formData.images.length;
      const availableSlots = 5 - currentCount;
      if (availableSlots <= 0) {
        setError('Maximum of 5 images allowed.');
        return;
      }
      setUploadingImages(true);
      try {
        const files = Array.from(e.target.files).slice(0, availableSlots);
        const uploadedUrls = await Promise.all(files.map((file) => uploadImage(file)));
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } catch (err: any) {
        console.error('Error uploading images:', err);
        setError('Failed to upload images.');
      } finally {
        setUploadingImages(false);
      }
    }
  };

  // Handler to remove an image by index
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
      images: formData.images,
    };
    try {
      const res = await fetch(`/api/hotels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update hotel');
      } else {
        setSuccess('Hotel updated successfully');
        // Optionally, refresh hotel details here
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
        credentials: 'include',
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
        {/* Hotel Logo Upload */}
        <div>
          <label className="block mb-1">Hotel Logo</label>
          <input
            type="file"
            name="logo"
            onChange={handleLogoChange}
            className="input input-bordered w-full"
            accept="image/*"
          />
          {uploadingLogo && <p>Uploading logo...</p>}
          {formData.logo && (
            <img
              src={formData.logo}
              alt="Hotel Logo Preview"
              className="mt-2 w-20 h-20 object-cover rounded"
            />
          )}
        </div>
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
        {/* Hotel Images Upload */}
        <div>
          <label className="block mb-1">Hotel Images (max 5)</label>
          <input
            type="file"
            name="images"
            onChange={handleImagesChange}
            className="input input-bordered w-full"
            accept="image/*"
            multiple
            disabled={formData.images.length >= 5}
          />
          {uploadingImages && <p>Uploading images...</p>}
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Hotel image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Update Hotel
        </button>
      </form>
      <button onClick={handleDelete} className="btn btn-danger w-full mt-4">
        Delete Hotel
      </button>
    </div>
  );
}

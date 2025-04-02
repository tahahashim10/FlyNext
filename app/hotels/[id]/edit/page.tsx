'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Hotel, 
  Upload, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Star, 
  MapPin 
} from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">Edit Hotel</h1>
              <p className="mt-4 text-lg max-w-2xl">
                Update your hotel details, logo, and images.
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

          <form onSubmit={handleUpdate} className="bg-card border border-border rounded-xl p-8 space-y-6">
            {/* Hotel Name */}
            <div>
              <label className="block mb-2 font-semibold">Hotel Name</label>
              <div className="flex items-center space-x-3">
                <Hotel className="h-6 w-6 text-primary" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter hotel name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            {/* Hotel Logo Upload */}
            <div>
              <label className="block mb-2 font-semibold">Hotel Logo</label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Hotel Logo Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted/10 rounded-lg flex items-center justify-center">
                      <Hotel className="h-12 w-12 text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <input
                      type="file"
                      name="logo"
                      onChange={handleLogoChange}
                      className="input input-bordered w-full"
                      accept="image/*"
                    />
                  </div>
                  {uploadingLogo && <p className="text-sm text-muted mt-2">Uploading logo...</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block mb-2 font-semibold">Address</label>
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-primary" />
                <input
                  type="text"
                  name="address"
                  placeholder="Enter hotel address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 font-semibold">Location/City</label>
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-primary" />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter city or region"
                  value={formData.location}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block mb-2 font-semibold">Star Rating</label>
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-primary" />
                <input
                  type="number"
                  name="starRating"
                  placeholder="Hotel star rating"
                  value={formData.starRating}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                  min="0"
                  max="5"
                />
              </div>
            </div>

            {/* Hotel Images Upload */}
            <div>
              <label className="block mb-2 font-semibold">Hotel Images (max 5)</label>
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="h-6 w-6 text-primary" />
                <input
                  type="file"
                  name="images"
                  onChange={handleImagesChange}
                  className="input input-bordered w-full"
                  accept="image/*"
                  multiple
                  disabled={formData.images.length >= 5}
                />
              </div>
              {uploadingImages && <p className="text-sm text-muted mb-2">Uploading images...</p>}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Hotel image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                type="submit" 
                className="btn btn-primary flex items-center justify-center"
              >
                Update Hotel
              </button>
              <button 
                type="button"
                onClick={handleDelete} 
                className="btn btn-danger flex items-center justify-center"
              >
                <Trash2 className="h-5 w-5 mr-2" /> Delete Hotel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
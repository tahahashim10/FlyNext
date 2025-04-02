'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Upload, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Bed, 
  DollarSign, 
  Key, 
  ArrowLeft 
} from 'lucide-react';
import { uploadImage } from '@/utils/uploadImage';
import Link from 'next/link';

interface RoomType {
  id: number;
  name: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  availableRooms: number;
}

export default function EditRoomTypePage() {
  // Expect URL to be like /hotels/[hotelId]/roomTypes/[roomId]
  const { id: hotelId, roomId } = useParams();
  const router = useRouter();
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amenities: '',
    pricePerNight: '',
    images: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const fetchRoomType = async () => {
      try {
        const res = await fetch(`/api/roomTypes/${roomId}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch room type');
        } else {
          const data = await res.json();
          setRoomType(data);
          setFormData({
            name: data.name || '',
            amenities: data.amenities ? data.amenities.join(', ') : '',
            pricePerNight: data.pricePerNight?.toString() || '',
            images: data.images || [],
          });
        }
      } catch (err: any) {
        setError('Error fetching room type');
      }
    };
    fetchRoomType();
  }, [roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      setUploading(true);
      try {
        const files = Array.from(e.target.files).slice(0, availableSlots);
        const uploadedUrls = await Promise.all(files.map((file) => uploadImage(file)));
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } catch (err: any) {
        console.error('Error uploading images:', err);
        setError('Failed to upload images.');
      } finally {
        setUploading(false);
      }
    }
  };

  // Handler to remove a specific image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: formData.name,
        amenities: formData.amenities.split(',').map(item => item.trim()).filter(Boolean),
        pricePerNight: Number(formData.pricePerNight),
        images: formData.images,
      };
      const res = await fetch(`/api/roomTypes/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update room type');
      } else {
        setSuccess('Room type updated successfully.');
      }
    } catch (err: any) {
      setError('Error updating room type');
    }
  };

  // Handler to delete room type
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room type? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/roomTypes/${roomId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete room type');
      } else {
        router.push(`/hotels/${hotelId}/roomTypes`);
      }
    } catch (err: any) {
      setError('Error deleting room type');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Edit Room Type</h1>
                <p className="mt-4 text-lg max-w-2xl">
                  Update details for your hotel room
                </p>
              </div>
              <Link 
                href={`/hotels/${hotelId}/roomTypes`} 
                className="btn btn-ghost btn-sm text-white flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
              </Link>
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

          {roomType ? (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
              {/* Room Name */}
              <div>
                <label className="block mb-2 font-semibold">Room Name</label>
                <div className="flex items-center space-x-3">
                  <Bed className="h-6 w-6 text-primary" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Deluxe Twin, Executive Suite"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block mb-2 font-semibold">Amenities</label>
                <div className="flex items-center space-x-3">
                  <Key className="h-6 w-6 text-primary" />
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="WiFi, TV, Air Conditioning (comma separated)"
                    className="input input-bordered w-full"
                  />
                </div>
                <p className="text-xs text-muted mt-1">Separate multiple amenities with commas</p>
              </div>

              {/* Price Per Night */}
              <div>
                <label className="block mb-2 font-semibold">Price Per Night</label>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    placeholder="Enter room price"
                    className="input input-bordered w-full"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Room Images Upload */}
              <div>
                <label className="block mb-2 font-semibold">Room Images (max 5)</label>
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
                {uploading && <p className="text-sm text-muted mb-2">Uploading images...</p>}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Room image ${index + 1}`}
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
                  Update Room Type
                </button>
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger flex items-center justify-center"
                >
                  <Trash2 className="h-5 w-5 mr-2" /> Delete Room Type
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Bed className="h-16 w-16 mx-auto text-primary mb-4" />
              <p className="text-muted">Loading room type details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
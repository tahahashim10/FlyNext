'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfileFormProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    phoneNumber?: string;
  };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email, // often email isn't editable
    phoneNumber: user.phoneNumber || '',
    profilePicture: user.profilePicture || '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          className="input input-bordered w-full"
          placeholder="Email"
          disabled
        />
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Phone Number"
        />
        <input
          type="url"
          name="profilePicture"
          value={formData.profilePicture}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Profile Picture URL"
        />
        <button type="submit" className="btn btn-primary w-full">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;

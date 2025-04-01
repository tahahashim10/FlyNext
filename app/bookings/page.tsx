'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Suggestions from '@/components/Suggestions';

export default function BookingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-populate from query parameters
  const preHotelId = searchParams.get('hotelId') || '';
  const preRoomId = searchParams.get('roomId') || '';
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';

  const [bookingData, setBookingData] = useState({
    hotelId: preHotelId,
    roomId: preRoomId,
    checkIn: preCheckIn,
    checkOut: preCheckOut,
    // For flight suggestions
    departureCity: '',
    destinationCity: '',
    // Flight booking fields
    flightIds: '',
    firstName: '',
    lastName: '',
    email: '',
    passportNumber: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setBookingData({
      hotelId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      departureCity: '',
      destinationCity: '',
      flightIds: '',
      firstName: '',
      lastName: '',
      email: '',
      passportNumber: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Build payload using hotel booking fields if provided.
    const payload: any = {};
    if (bookingData.hotelId && bookingData.roomId) {
      payload.hotelId = Number(bookingData.hotelId);
      payload.roomId = Number(bookingData.roomId);
      if (bookingData.checkIn && bookingData.checkOut) {
        payload.checkIn = bookingData.checkIn;
        payload.checkOut = bookingData.checkOut;
      }
    }
    // Only add flight booking data if flightIds is non-empty.
    if (bookingData.flightIds.trim() !== '') {
      payload.flightIds = bookingData.flightIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      payload.firstName = bookingData.firstName;
      payload.lastName = bookingData.lastName;
      payload.email = bookingData.email;
      payload.passportNumber = bookingData.passportNumber;
    }

    // Debug: log payload
    console.log("Booking payload:", payload);

    if (!payload.hotelId && !payload.flightIds) {
      setError('Please provide either hotel or flight booking details.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Error response:", data);
        setError(data.error || 'Failed to create booking');
        setLoading(false);
      } else {
        const data = await res.json();
        // Determine success message based on response keys
        if (data.flightBooking && data.hotelBooking) {
          setSuccess('Bookings added to your cart!');
        } else if (data.flightBooking || data.hotelBooking) {
          setSuccess('Booking added to your cart!');
        } else {
          setError('Unexpected booking response');
          setLoading(false);
          return;
        }
        clearForm();
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setError('Error creating booking');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Book Your Itinerary</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hotel Booking Section */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Hotel Reservation (Optional)</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <label className="label">Hotel ID</label>
              <input
                type="number"
                name="hotelId"
                value={bookingData.hotelId}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Hotel ID"
              />
            </div>
            <div className="flex-1">
              <label className="label">Room ID</label>
              <input
                type="number"
                name="roomId"
                value={bookingData.roomId}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Room ID"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <div className="flex-1">
              <label className="label">Check-In</label>
              <input
                type="date"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <label className="label">Check-Out</label>
              <input
                type="date"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="label">Departure City (for flight suggestions)</label>
            <input
              type="text"
              name="departureCity"
              placeholder="e.g. Toronto"
              value={bookingData.departureCity}
              onChange={handleChange}
              className="input input-bordered w-full mb-2"
            />
            <button
              type="button"
              onClick={() => setShowFlightSuggestions(!showFlightSuggestions)}
              className="btn btn-secondary btn-sm"
            >
              Get Flight Suggestions
            </button>
            {showFlightSuggestions && (
              <Suggestions
                type="flight"
                query={bookingData.departureCity}
                placeholder="Select a flight origin"
                onSelect={(selected: string) =>
                  setBookingData({ ...bookingData, departureCity: selected })
                }
              />
            )}
          </div>
        </div>

        {/* Flight Booking Section (Optional) */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Flight Reservation (Optional)</h3>
          <label className="label">Flight IDs (comma separated)</label>
          <input
            type="text"
            name="flightIds"
            placeholder="E.g. 1234-5678, 2345-6789"
            value={bookingData.flightIds}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <label className="label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={bookingData.firstName}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <label className="label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={bookingData.lastName}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <div className="flex-1">
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={bookingData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <label className="label">Passport #</label>
              <input
                type="text"
                name="passportNumber"
                value={bookingData.passportNumber}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="label">Destination City (for hotel suggestions)</label>
            <input
              type="text"
              name="destinationCity"
              placeholder="e.g. Vancouver"
              value={bookingData.destinationCity}
              onChange={handleChange}
              className="input input-bordered w-full mb-2"
            />
            <button
              type="button"
              onClick={() => setShowHotelSuggestions(!showHotelSuggestions)}
              className="btn btn-secondary btn-sm"
            >
              Get Hotel Suggestions
            </button>
            {showHotelSuggestions && (
              <Suggestions
                type="hotel"
                query={bookingData.destinationCity}
                placeholder="Select a destination city"
                onSelect={(selected: string) =>
                  setBookingData({ ...bookingData, destinationCity: selected })
                }
              />
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Booking...' : 'Book Itinerary'}
        </button>
      </form>
    </div>
  );
}

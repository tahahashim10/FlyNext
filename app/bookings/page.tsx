'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Suggestions from '@/components/Suggestions';

export default function BookingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-populate from query
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
    // Actual flight booking data
    flightIds: '',
    firstName: '',
    lastName: '',
    email: '',
    passportNumber: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Build the payload
    const payload: any = {};

    // If the user has a valid hotel ID & room ID, add hotel booking data
    if (bookingData.hotelId && bookingData.roomId) {
      payload.hotelId = Number(bookingData.hotelId);
      payload.roomId = Number(bookingData.roomId);
      if (bookingData.checkIn && bookingData.checkOut) {
        payload.checkIn = bookingData.checkIn;
        payload.checkOut = bookingData.checkOut;
      }
    }

    // If flight IDs were entered, add flight booking data
    if (bookingData.flightIds.trim()) {
      payload.flightIds = bookingData.flightIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      payload.firstName = bookingData.firstName;
      payload.lastName = bookingData.lastName;
      payload.email = bookingData.email;
      payload.passportNumber = bookingData.passportNumber;
    }

    // If neither hotel nor flight data is provided, show an error
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
        setError(data.error || 'Failed to create booking');
        setLoading(false);
      } else {
        const data = await res.json();
        let booking, bookingType;
        if (data.flightBooking) {
          booking = data.flightBooking;
          bookingType = 'flight';
        } else if (data.hotelBooking) {
          booking = data.hotelBooking;
          bookingType = 'hotel';
        } else {
          setError('Unexpected booking response');
          setLoading(false);
          return;
        }
        // Go to checkout with bookingId, bookingType
        router.push(`/checkout?bookingId=${booking.id}&bookingType=${bookingType}`);
      }
    } catch (err: any) {
      setError('Error creating booking');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Book Your Itinerary</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

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
                onSelect={(selected: string) => {
                  setBookingData({ ...bookingData, departureCity: selected });
                }}
              />
            )}
          </div>
        </div>

        {/* Flight Booking Section */}
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
                placeholder="Select a city for hotel suggestions"
                onSelect={(selected: string) => {
                  setBookingData({ ...bookingData, destinationCity: selected });
                }}
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Suggestions from '@/components/Suggestions';

export default function BookingFormPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState({
    hotelId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    flightIds: '',
    firstName: '',
    lastName: '',
    email: '',
    passportNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepare payload based on which booking parts are filled
    const payload: any = {};
    if (bookingData.hotelId && bookingData.roomId) {
      payload.hotelId = Number(bookingData.hotelId);
      payload.roomId = Number(bookingData.roomId);
      if (bookingData.checkIn && bookingData.checkOut) {
        payload.checkIn = bookingData.checkIn;
        payload.checkOut = bookingData.checkOut;
      }
    }
    if (bookingData.flightIds.trim()) {
      payload.flightIds = bookingData.flightIds.split(',').map(id => id.trim()).filter(Boolean);
      payload.firstName = bookingData.firstName;
      payload.lastName = bookingData.lastName;
      payload.email = bookingData.email;
      payload.passportNumber = bookingData.passportNumber;
    }
    if (!payload.hotelId && !payload.flightIds) {
      setError('Please provide at least hotel or flight booking details.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
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
        // Prioritize flight booking if available, otherwise hotel
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
        // Navigate to checkout page with query parameters
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
        {/* Hotel Reservation Section */}
        <div>
          <h3 className="font-semibold">Hotel Reservation (Optional)</h3>
          <input
            type="number"
            name="hotelId"
            placeholder="Hotel ID"
            value={bookingData.hotelId}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="number"
            name="roomId"
            placeholder="Room ID"
            value={bookingData.roomId}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <div className="flex gap-4 mb-2">
            <input
              type="date"
              name="checkIn"
              placeholder="Check-In Date"
              value={bookingData.checkIn}
              onChange={handleChange}
              className="input input-bordered flex-1"
            />
            <input
              type="date"
              name="checkOut"
              placeholder="Check-Out Date"
              value={bookingData.checkOut}
              onChange={handleChange}
              className="input input-bordered flex-1"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFlightSuggestions(true)}
            className="btn btn-secondary btn-sm mb-2"
          >
            Show Flight Suggestions for This City
          </button>
          {showFlightSuggestions && (
            <Suggestions type="flight" query={bookingData.hotelId} />
          )}
        </div>

        {/* Flight Reservation Section */}
        <div>
          <h3 className="font-semibold">Flight Reservation (Optional)</h3>
          <input
            type="text"
            name="flightIds"
            placeholder="Flight IDs (comma separated)"
            value={bookingData.flightIds}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={bookingData.firstName}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={bookingData.lastName}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={bookingData.email}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="text"
            name="passportNumber"
            placeholder="Passport Number"
            value={bookingData.passportNumber}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          />
          <button
            type="button"
            onClick={() => setShowHotelSuggestions(true)}
            className="btn btn-secondary btn-sm mb-2"
          >
            Show Hotel Suggestions for This City
          </button>
          {showHotelSuggestions && (
            <Suggestions type="hotel" query={bookingData.email} /> // Adjust query as needed
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Booking...' : 'Book Itinerary'}
        </button>
      </form>
    </div>
  );
}

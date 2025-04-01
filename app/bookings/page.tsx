'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HotelSuggestionsPanel from '@/components/HotelSuggestionsPanel';
import RoomSuggestionsPanel from '@/components/RoomSuggestionsPanel';
import FlightSuggestionsPanel from '@/components/FlightSuggestionsPanel';

export default function BookingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-populate fields from query parameters if available.
  const preHotelId = searchParams.get('hotelId') || '';
  const preRoomId = searchParams.get('roomId') || '';
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';
  const preFlightIds = searchParams.get('flightIds') || '';
  const preDestinationCity = searchParams.get('destinationCity') || '';

  const [bookingData, setBookingData] = useState({
    hotelId: preHotelId,
    roomId: preRoomId,
    checkIn: preCheckIn,
    checkOut: preCheckOut,
    destinationCity: preDestinationCity,
    departureCity: '',
    flightIds: preFlightIds,
    firstName: '',
    lastName: '',
    email: '',
    passportNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  // Toggle suggestion panels
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);

  const routerPush = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setBookingData({
      hotelId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      destinationCity: '',
      departureCity: '',
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

    // Build payload based on provided details.
    const payload: any = {};
    if (bookingData.hotelId && bookingData.roomId) {
      payload.hotelId = Number(bookingData.hotelId);
      payload.roomId = Number(bookingData.roomId);
      if (bookingData.checkIn && bookingData.checkOut) {
        payload.checkIn = bookingData.checkIn;
        payload.checkOut = bookingData.checkOut;
      }
    }
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
        <div className="border p-4 rounded mb-4">
          <h3 className="font-semibold mb-2">Hotel Reservation (Optional)</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <label className="label">Hotel ID</label>
              <input
                type="number"
                name="hotelId"
                value={bookingData.hotelId}
                onChange={(e) => {
                  handleChange(e);
                  if (!e.target.value) setShowHotelSuggestions(true);
                  else setShowHotelSuggestions(false);
                }}
                className="input input-bordered w-full"
                placeholder="Enter Hotel ID or search by destination"
              />
              {(!bookingData.hotelId || bookingData.hotelId === '') &&
                bookingData.destinationCity.trim() !== '' &&
                showHotelSuggestions && (
                  <HotelSuggestionsPanel
                    query={bookingData.destinationCity}
                    onSelect={(selectedId) => {
                      setBookingData({ ...bookingData, hotelId: selectedId.toString() });
                      setShowHotelSuggestions(false);
                    }}
                  />
                )}
            </div>
            <div className="flex-1 relative">
              <label className="label">Room ID</label>
              <input
                type="number"
                name="roomId"
                value={bookingData.roomId}
                onChange={(e) => {
                  handleChange(e);
                  if (bookingData.hotelId && !e.target.value) setShowRoomSuggestions(true);
                  else setShowRoomSuggestions(false);
                }}
                className="input input-bordered w-full"
                placeholder="Enter Room ID or select from available rooms"
              />
              {bookingData.hotelId && ( !bookingData.roomId || bookingData.roomId === '') && bookingData.checkIn && bookingData.checkOut && (
                <RoomSuggestionsPanel
                  hotelId={Number(bookingData.hotelId)}
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  onSelect={(selectedRoomId) =>
                    setBookingData({ ...bookingData, roomId: selectedRoomId.toString() })
                  }
                />
              )}

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
            {showFlightSuggestions && bookingData.hotelId && bookingData.checkIn && (
              <FlightSuggestionsPanel
                hotelId={Number(bookingData.hotelId)}
                suggestedDate={bookingData.checkIn}
                departureCity={bookingData.departureCity}
                onSelect={(selectedFlightId) =>
                  setBookingData({ ...bookingData, flightIds: selectedFlightId })
                }
              />
            )}
          </div>
        </div>

        {/* Flight Booking Section */}
        <div className="border p-4 rounded mb-4">
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
            {bookingData.destinationCity.trim() !== '' && showHotelSuggestions && (
              <HotelSuggestionsPanel
                query={bookingData.destinationCity}
                onSelect={(selectedId) => {
                  // Here you might auto‑fill a hidden field or update state
                  // For example, clear the destinationCity input since the suggestion was selected:
                  setBookingData({ ...bookingData, destinationCity: '' });
                  setShowHotelSuggestions(false);
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

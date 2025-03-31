'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Booking {
  id: number;
  status: string;
  // Hotel booking fields:
  hotel?: { name: string; location: string };
  room?: { name: string; pricePerNight: number };
  checkIn?: string;
  checkOut?: string;
  // Flight booking field:
  flightBookingReference?: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const bookingType = searchParams.get('bookingType');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!bookingId || !bookingType) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch('/api/bookings/user', { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch booking details');
        } else {
          const data = await res.json();
          let foundBooking = null;
          if (bookingType === 'hotel' && data.hotelBookings) {
            foundBooking = data.hotelBookings.find((b: Booking) => b.id.toString() === bookingId);
          } else if (bookingType === 'flight' && data.flightBookings) {
            foundBooking = data.flightBookings.find((b: Booking) => b.id.toString() === bookingId);
          }
          if (!foundBooking) {
            setError('Booking not found');
          } else {
            setBooking(foundBooking);
          }
        }
      } catch (err: any) {
        setError('Error fetching booking details');
      }
    };
    fetchBooking();
  }, [bookingId, bookingType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        bookingId: Number(bookingId),
        bookingType,
        cardNumber: cardInfo.cardNumber,
        expiryMonth: Number(cardInfo.expiryMonth),
        expiryYear: Number(cardInfo.expiryYear)
      };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Checkout failed');
        setLoading(false);
      } else {
        setSuccess('Booking confirmed! Invoice generated.');
        // Open PDF invoice in new tab
        window.open(`/api/invoice?bookingId=${bookingId}&bookingType=${bookingType}`, '_blank');
        setLoading(false);
      }
    } catch (err: any) {
      setError('Error during checkout');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {booking ? (
        <div className="border p-4 rounded mb-4">
          <h3 className="font-semibold">Booking Details</h3>
          {bookingType === 'hotel' && booking.hotel && booking.room ? (
            <>
              <p>Hotel: {booking.hotel.name}</p>
              <p>Location: {booking.hotel.location}</p>
              <p>Room: {booking.room.name}</p>
              <p>Price per Night: {booking.room.pricePerNight}</p>
              <p>Check-in: {new Date(booking.checkIn!).toLocaleDateString()}</p>
              <p>Check-out: {new Date(booking.checkOut!).toLocaleDateString()}</p>
            </>
          ) : bookingType === 'flight' ? (
            <>
              <p>Flight Booking Reference: {booking.flightBookingReference}</p>
              {/* Additional flight details can be rendered here */}
            </>
          ) : null}
        </div>
      ) : (
        <p>Loading booking details...</p>
      )}

      <form onSubmit={handleCheckout} className="space-y-4">
        <h3 className="font-semibold">Enter Payment Details</h3>
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={cardInfo.cardNumber}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <div className="flex gap-4">
          <input
            type="number"
            name="expiryMonth"
            placeholder="Expiry Month"
            value={cardInfo.expiryMonth}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="number"
            name="expiryYear"
            placeholder="Expiry Year"
            value={cardInfo.expiryYear}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Processing...' : 'Checkout'}
        </button>
      </form>
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}

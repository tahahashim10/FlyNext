'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HotelBooking {
  id: number;
  status: string;
  hotel: { name: string; location: string };
  room: { name: string; pricePerNight: number };
  checkIn: string;
  checkOut: string;
}

interface FlightBooking {
  id: number;
  status: string;
  flightIds: string[] | string; // stored as JSON; could be an array or a string
  cost?: number;
}

interface BookingsResponse {
  hotelBookings: HotelBooking[];
  flightBookings: FlightBooking[];
}

interface SelectedBooking {
  id: number;
  type: 'hotel' | 'flight';
}

export default function CartPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingsResponse>({ hotelBookings: [], flightBookings: [] });
  const [selectedBookings, setSelectedBookings] = useState<SelectedBooking[]>([]);
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiryMonth: '', expiryYear: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the user's pending bookings from your /api/bookings/user endpoint.
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings/user', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch bookings');
      } else {
        const data: BookingsResponse = await res.json();
        // Filter to only PENDING bookings
        const pendingHotel = data.hotelBookings.filter(b => b.status === 'PENDING');
        const pendingFlight = data.flightBookings.filter(b => b.status === 'PENDING');
        setBookings({ hotelBookings: pendingHotel, flightBookings: pendingFlight });
      }
    } catch (err) {
      setError('Error fetching bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Toggle selection for a booking
  const toggleSelectBooking = (id: number, type: 'hotel' | 'flight') => {
    setSelectedBookings(prev => {
      const exists = prev.find(b => b.id === id && b.type === type);
      if (exists) {
        return prev.filter(b => !(b.id === id && b.type === type));
      } else {
        return [...prev, { id, type }];
      }
    });
  };

  // Compute hotel booking cost: price per night * number of nights
  const computeHotelCost = (booking: HotelBooking): number => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return booking.room.pricePerNight * nights;
  };

  // Calculate total cost for selected bookings
  const totalCost = selectedBookings.reduce((sum, sel) => {
    if (sel.type === 'hotel') {
      const booking = bookings.hotelBookings.find(b => b.id === sel.id);
      if (booking) {
        return sum + computeHotelCost(booking);
      }
    } else if (sel.type === 'flight') {
      const booking = bookings.flightBookings.find(b => b.id === sel.id);
      if (booking && booking.cost) {
        return sum + booking.cost;
      }
    }
    return sum;
  }, 0);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  // Process checkout for each selected booking
  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    if (selectedBookings.length === 0) {
      setError('Please select at least one booking to checkout.');
      return;
    }
    if (!cardInfo.cardNumber || !cardInfo.expiryMonth || !cardInfo.expiryYear) {
      setError('Please enter your payment details.');
      return;
    }
    setLoading(true);
    try {
      // Process each selected booking by calling your POST /api/checkout route
      for (const sel of selectedBookings) {
        const payload = {
          bookingId: sel.id,
          bookingType: sel.type,
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
          throw new Error(`Checkout failed for booking ${sel.id}: ${data.error || ''}`);
        }
      }
      setSuccess('Selected bookings confirmed successfully!');
      // Refresh bookings and clear selections
      await fetchBookings();
      setSelectedBookings([]);
    } catch (err: any) {
      setError(err.message || 'Error during checkout');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Booking Cart</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {/* Hotel Bookings Table */}
      <div className="mb-4">
        <h3 className="font-semibold">Hotel Bookings</h3>
        {bookings.hotelBookings.length === 0 ? (
          <p>No pending hotel bookings.</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Select</th>
                <th>Booking ID</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {bookings.hotelBookings.map(booking => (
                <tr key={booking.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedBookings.find(sel => sel.id === booking.id && sel.type === 'hotel')}
                      onChange={() => toggleSelectBooking(booking.id, 'hotel')}
                    />
                  </td>
                  <td>{booking.id}</td>
                  <td>{booking.hotel.name}</td>
                  <td>{booking.room.name}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>${computeHotelCost(booking).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Flight Bookings Table */}
      <div className="mb-4">
        <h3 className="font-semibold">Flight Bookings</h3>
        {bookings.flightBookings.length === 0 ? (
          <p>No pending flight bookings.</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Select</th>
                <th>Booking ID</th>
                <th>Flight IDs</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {bookings.flightBookings.map(booking => (
                <tr key={booking.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedBookings.find(sel => sel.id === booking.id && sel.type === 'flight')}
                      onChange={() => toggleSelectBooking(booking.id, 'flight')}
                    />
                  </td>
                  <td>{booking.id}</td>
                  <td>
                    {Array.isArray(booking.flightIds)
                      ? booking.flightIds.join(', ')
                      : booking.flightIds}
                  </td>
                  <td>${booking.cost ? booking.cost.toFixed(2) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total Cost Display */}
      <div className="mb-4">
        <h3 className="font-semibold">Total Cost: ${totalCost.toFixed(2)}</h3>
      </div>

      {/* Payment Details */}
      <div className="mb-4">
        <h3 className="font-semibold">Enter Payment Details</h3>
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={cardInfo.cardNumber}
          onChange={handleCardChange}
          className="input input-bordered w-full mb-2"
        />
        <div className="flex gap-4">
          <input
            type="number"
            name="expiryMonth"
            placeholder="Expiry Month"
            value={cardInfo.expiryMonth}
            onChange={handleCardChange}
            className="input input-bordered w-full"
          />
          <input
            type="number"
            name="expiryYear"
            placeholder="Expiry Year"
            value={cardInfo.expiryYear}
            onChange={handleCardChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <button onClick={handleCheckout} className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Processing...' : 'Checkout Selected Bookings'}
      </button>
    </div>
  );
}

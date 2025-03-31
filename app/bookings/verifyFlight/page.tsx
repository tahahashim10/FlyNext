'use client';

import { useState } from 'react';

export default function VerifyFlightPage() {
  const [lastName, setLastName] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const res = await fetch(
        `/api/bookings/verifyFlight?lastName=${encodeURIComponent(lastName)}&bookingReference=${encodeURIComponent(bookingReference)}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Verification failed');
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch (err: any) {
      setError('Error verifying flight booking');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Verify Flight Booking</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          placeholder="Booking Reference"
          value={bookingReference}
          onChange={(e) => setBookingReference(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Verify
        </button>
      </form>
      {result && (
        <div className="mt-4 p-4 border rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

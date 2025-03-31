'use client';

import React, { useState } from 'react';

interface BookingSummary {
  status: string;
  bookingReference: string;
  ticketNumber: string;
}

export default function VerifyFlightBookingPage() {
  const [lastName, setLastName] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSummary(null);
    try {
      const res = await fetch(
        `/api/bookings/verifyFlight?lastName=${encodeURIComponent(lastName)}&bookingReference=${encodeURIComponent(bookingReference)}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed');
      } else {
        const bookingSummary: BookingSummary = {
          status: data.status || 'unknown',
          bookingReference: data.bookingReference,
          ticketNumber: data.ticketNumber
        };
        setSummary(bookingSummary);
      }
    } catch (err: any) {
      setError('Error verifying booking');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Verify Flight Booking</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleVerify} className="space-y-4">
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
          Verify Booking
        </button>
      </form>
      {summary && (
        <div className="mt-6 p-4 border rounded shadow">
          <h2 className="text-2xl font-semibold mb-2">Booking Summary</h2>
          <p>
            <strong>Status:</strong> {summary.status}
          </p>
          <p>
            <strong>Booking Reference:</strong> {summary.bookingReference}
          </p>
          <p>
            <strong>Ticket Number:</strong> {summary.ticketNumber}
          </p>
        </div>
      )}
    </div>
  );
}

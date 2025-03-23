'use client';

import FlightSearchForm from '../../../components/FlightSearchForm';

export default function FlightsPage() {
  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Search Flights</h2>
      <FlightSearchForm />
    </div>
  );
}

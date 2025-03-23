'use client';

import HotelSearchForm from '../../../components/HotelSearchForm';

export default function HotelsPage() {
  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Search Hotels</h2>
      <HotelSearchForm />
    </div>
  );
}

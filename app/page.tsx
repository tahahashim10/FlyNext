'use client';

import React, { useState } from 'react';
import FlightSearchForm from '../components/FlightSearchForm';
import HotelSearchForm from '../components/HotelSearchForm';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start pt-10">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-4xl">
        {/* Tab Buttons */}
        <div className="flex border-b mb-4">
          <button
            className={`px-6 py-3 text-sm font-medium focus:outline-none ${
              activeTab === 'flights'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('flights')}
          >
            Flights
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium focus:outline-none ${
              activeTab === 'hotels'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('hotels')}
          >
            Hotels
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'flights' ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Flights</h2>
            <FlightSearchForm />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Hotels</h2>
            <HotelSearchForm />
          </div>
        )}
      </div>
    </div>
  );
}

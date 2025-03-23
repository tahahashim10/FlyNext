'use client';

import React, { useState } from 'react';
import FlightSearchForm from '../components/FlightSearchForm';
import HotelSearchForm from '../components/HotelSearchForm';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        {/* Tab Buttons */}
        <div className="flex justify-center border-b mb-6">
          <button
            className={`px-6 py-3 text-lg font-medium focus:outline-none ${
              activeTab === 'flights' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('flights')}
          >
            Flights
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium focus:outline-none ${
              activeTab === 'hotels' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('hotels')}
          >
            Hotels
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'flights' ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Search Flights</h2>
              <FlightSearchForm />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Search Hotels</h2>
              <HotelSearchForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

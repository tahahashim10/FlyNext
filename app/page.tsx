'use client';

import { useState } from 'react';
import Link from 'next/link';
import FlightSearchForm from '../components/FlightSearchForm';
// import HotelSearchForm from '../components/HotelSearchForm'; // implement later

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-5xl font-bold text-center mb-8">
        Welcome to FlyNext!
      </h1>
      <div className="tabs justify-center mb-8">
        <button
          className={`tab tab-lifted ${activeTab === 'flights' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          Flights
        </button>
        <button
          className={`tab tab-lifted ${activeTab === 'hotels' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('hotels')}
        >
          Hotels
        </button>
      </div>
      {activeTab === 'flights' ? (
        <FlightSearchForm />
      ) : (
        <p>Hotel search coming soon...</p>
      )}
    </div>
  );
}

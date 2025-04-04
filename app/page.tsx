'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FlightSearchForm from '../components/FlightSearchForm';
import HotelSearchForm from '../components/HotelSearchForm';
import Footer from '../components/Footer';
import { Plane, Hotel } from 'lucide-react';
import CookiePolicyModal from '../components/CookiePolicyModal';
import Link from 'next/link';
import FeaturedHotels from '../components/FeaturedHotels';

// Loading component for Suspense fallback
function HomePageLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with background image */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full bg-gradient-to-r from-secondary to-primary/40">
        <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
          <div className="w-full max-w-md animate-pulse">
            <div className="h-10 bg-white/30 rounded mb-4"></div>
            <div className="h-5 bg-white/30 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Search container loading state */}
      <div className="container mx-auto px-4 -mt-16 mb-10 relative z-25 search-section">
        <div className="bg-card shadow-lg rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-10 bg-muted/50 rounded mb-4"></div>
            <div className="h-24 bg-muted/50 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  useEffect(() => {
    // Check URL parameters for tab
    const tabParam = searchParams.get('tab');
    if (tabParam === 'hotels') {
      setActiveTab('hotels');
    } else if (tabParam === 'flights') {
      setActiveTab('flights');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with background image */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full bg-gradient-to-r from-secondary to-primary/40">
        <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Find your perfect journey with FlyNext
          </h1>
          <p className="text-lg md:text-xl mt-4 text-center max-w-2xl">
            Search and book hotels and flights around the world with our easy-to-use platform
          </p>
        </div>
      </div>

      {/* Search container that overlaps hero and content */}
      <div className="container mx-auto px-4 -mt-16 mb-10 relative z-25 search-section">
        <div className="bg-card shadow-lg rounded-xl overflow-visible">
          {/* Tab navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-1 py-4 text-center font-medium text-lg transition-colors flex items-center justify-center ${
                activeTab === 'flights' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Plane className="mr-2 h-5 w-5" />
              Flights
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex-1 py-4 text-center font-medium text-lg transition-colors flex items-center justify-center ${
                activeTab === 'hotels' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Hotel className="mr-2 h-5 w-5" />
              Hotels
            </button>
          </div>

          {/* Tab content - Modified to allow dropdown overflow */}
          <div className="p-6 overflow-visible">
            {activeTab === 'flights' ? (
              <FlightSearchForm />
            ) : (
              <HotelSearchForm />
            )}
          </div>
        </div>
      </div>

      {/* Feature sections */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-12">Why book with FlyNext?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-muted">Find a lower price? We'll match it and give you an additional discount.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
            <p className="text-muted">Your payment and personal information are always protected with us.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-muted">Our friendly customer service team is available around the clock to help you.</p>
          </div>
        </div>
      </div>

      {/* Featured Hotels section */}
      <div className="bg-muted/5 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Top Rated Hotels</h2>
          
          <FeaturedHotels />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      <CookiePolicyModal />
    </div>
  );
}

// Main component with Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomeContent />
    </Suspense>
  );
}
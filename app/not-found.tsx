'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with background image */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full bg-gradient-to-r from-secondary to-primary/40">
        <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-center mb-4 text-primary drop-shadow-lg">
            404
          </h1>
          <p className="text-2xl md:text-3xl text-center max-w-2xl mb-8">
            Oops! Page Not Found
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="bg-card shadow-lg rounded-xl p-8 max-w-xl w-full">
          <p className="text-xl text-muted mb-6">
            The page you're looking for seems to have taken an unexpected detour. 
            Don't worry, we'll help you find your way back to safety.
          </p>
          
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg hover:scale-105 transition-transform"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Link>
        </div>
      </div>

      {/* Benefits section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-12">While You're Here</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Explore Destinations</h3>
            <p className="text-muted">Discover amazing travel opportunities with FlyNext.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Book with Confidence</h3>
            <p className="text-muted">Secure and easy booking process for your next adventure.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
            <p className="text-muted">We're here to help you every step of the way.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
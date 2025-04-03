'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleQuickSearch = (type: 'flights' | 'hotels') => {
    router.push(`/?tab=${type}`);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMyBookings = () => {
    if (user) {
      router.push('/bookings/user');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto items-start">
          {/* Left Column - FlyNext */}
          <div className="pl-4">
            <Link 
              href="/" 
              className="font-bold text-xl text-primary block mb-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              FlyNext
            </Link>
            <p className="text-muted text-sm pr-4">
              Your trusted travel companion for hotels and flights worldwide.
            </p>
            
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Center Column - Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleQuickSearch('hotels')} 
                  className="text-muted hover:text-primary transition-colors"
                >
                  Search Hotels
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickSearch('flights')} 
                  className="text-muted hover:text-primary transition-colors"
                >
                  Search Flights
                </button>
              </li>
              <li>
                <button 
                  onClick={handleMyBookings} 
                  className="text-muted hover:text-primary transition-colors"
                >
                  My Bookings
                </button>
              </li>
            </ul>
          </div>
          
          {/* Right Column - Legal */}
          <div className="text-right">
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms-and-conditions" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-muted hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-muted hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/accessibility" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-muted hover:text-primary transition-colors"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-4 text-sm text-center text-muted">
          <p>&copy; {new Date().getFullYear()} FlyNext. All rights reserved.</p>
          <p className="mt-1">
            Designed with <span className="text-primary">♥</span> for travelers around the world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
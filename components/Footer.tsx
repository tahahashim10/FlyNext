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
    // Navigate to home page with correct tab and smooth scroll
    router.push(`/?tab=${type}`);
    
    // Ensure smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMyBookings = () => {
    // If user is logged in, route to bookings page
    if (user) {
      router.push('/bookings/user');
      
      // Ensure smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // If not logged in, scroll to top of the page
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link 
              href="/" 
              className="font-bold text-xl text-primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              FlyNext
            </Link>
            <p className="mt-4 text-muted">
              Your trusted travel companion for hotels and flights worldwide.
            </p>
            
            <div className="mt-6 flex space-x-4">
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
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleQuickSearch('hotels')} 
                  className="text-muted hover:text-primary transition-colors w-full text-left"
                >
                  Search Hotels
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickSearch('flights')} 
                  className="text-muted hover:text-primary transition-colors w-full text-left"
                >
                  Search Flights
                </button>
              </li>
              <li>
                <button 
                  onClick={handleMyBookings} 
                  className="text-muted hover:text-primary transition-colors w-full text-left"
                >
                  My Bookings
                </button>
              </li>
              <li>
                <Link 
                  href="/hotels/management" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-muted hover:text-primary transition-colors"
                >
                  Hotel Management
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Verify</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/bookings/verifyFlight" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-muted hover:text-primary transition-colors"
                >
                  Verify Flight
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
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
        
        <div className="border-t border-border mt-8 pt-8 text-sm text-center text-muted">
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
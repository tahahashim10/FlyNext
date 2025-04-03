'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import {
  User,
  ShoppingCart,
  LogOut,
  Compass,
  Hotel,
  Book,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const NavBar: React.FC = () => {
  const router = useRouter();
  const { user, logout: contextLogout } = useAuth();
  const [cartCount, setCartCount] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch pending bookings (cart items) count when user is logged in
  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        try {
          const res = await fetch('/api/bookings/user', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            // Count bookings with status 'PENDING' from both hotel and flight bookings
            const pendingHotel = Array.isArray(data.hotelBookings)
              ? data.hotelBookings.filter((b: any) => b.status === 'PENDING').length
              : 0;
            const pendingFlight = Array.isArray(data.flightBookings)
              ? data.flightBookings.filter((b: any) => b.status === 'PENDING').length
              : 0;
            setCartCount(pendingHotel + pendingFlight);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      };
      fetchCartCount();
    }
  }, [user]);

  // Updated logout handler to use router navigation instead of window.location
  const handleLogout = async () => {
    try {
      // First handle the logout API call
      await fetch('/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Then clear local auth state
      contextLogout();
      
      // Use Next.js router for SPA navigation
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav
      className={`sticky top-0 z-30 transition-all duration-200 ${
        isScrolled ? 'bg-background shadow-nav' : 'bg-background'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary font-bold text-xl md:text-2xl">FlyNext</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted/10 ml-2"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user ? (
              <>
                <Link
                  href="/bookings"
                  className="text-foreground hover:text-primary flex items-center"
                >
                  <Compass size={18} className="mr-1" />
                  <span>Book Itinerary</span>
                </Link>

                <div className="border-l h-6 border-border mx-2"></div>

                <NotificationDropdown />

                <Link
                  href="/hotels/management"
                  className="text-foreground hover:text-primary flex items-center"
                >
                  <Hotel size={18} className="mr-1" />
                  <span>Hotel Management</span>
                </Link>

                <Link
                  href="/bookings/user"
                  className="text-foreground hover:text-primary flex items-center"
                >
                  <Book size={18} className="mr-1" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  href="/checkout/cart"
                  className="relative text-foreground hover:text-primary"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-1 text-foreground hover:text-primary">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-card rounded-md shadow-lg py-1 z-40 invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100">
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted/10">
                      Profile
                    </Link>
                    <Link
                      href="/bookings/verifyFlight"
                      className="block px-4 py-2 text-sm hover:bg-muted/10"
                    >
                      Verify Flight
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/10"
                    >
                      <span className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </span>
                    </button>

                    <div className="px-4 py-2 flex items-center justify-between border-t border-border">
                      <span className="text-sm text-muted">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* For non-signed in users, we remove the "Book Itinerary" link */}
                <ThemeToggle />
                <Link href="/login" className="btn-outline text-foreground">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card shadow-lg rounded-b-lg">
          <div className="pt-2 pb-4 space-y-1 px-4">
            {user ? (
              <>
                <Link href="/bookings" className="block py-2 text-foreground hover:text-primary">
                  <Compass size={18} className="mr-1 inline" />
                  <span>Book Itinerary</span>
                </Link>
                <div className="border-t border-border my-2"></div>
                <Link
                  href="/hotels/management"
                  className="block py-2 text-foreground hover:text-primary flex items-center"
                >
                  <Hotel size={18} className="mr-1" />
                  <span>Hotel Management</span>
                </Link>
                <Link
                  href="/bookings/user"
                  className="block py-2 text-foreground hover:text-primary flex items-center"
                >
                  <Book size={18} className="mr-1" />
                  <span>My Bookings</span>
                </Link>
                {/* Mobile Notification Dropdown */}
                <div className="block py-2">
                  <NotificationDropdown />
                </div>
                <Link
                  href="/checkout/cart"
                  className="flex items-center py-2 text-foreground hover:text-primary"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/bookings/verifyFlight"
                  className="block py-2 text-foreground hover:text-primary"
                >
                  Verify Flight
                </Link>
                <Link href="/profile" className="block py-2 text-foreground hover:text-primary">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-foreground hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-border my-2"></div>
                <Link href="/login" className="block py-2 text-foreground hover:text-primary">
                  Login
                </Link>
                <Link href="/signup" className="block py-2 text-foreground hover:text-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import NotificationDropdown from './NotificationDropdown';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState<number>(0);

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

  return (
    <nav className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          FlyNext
        </Link>
      </div>
      <div className="flex-none space-x-4">
        {user ? (
          <>
            <NotificationDropdown />
            <Link href="/hotels/management" className="btn btn-ghost">
              Hotel Management
            </Link>
            <Link href="/bookings/user" className="btn btn-ghost">
              My Bookings
            </Link>
            <Link href="/bookings/verifyFlight" className="btn btn-ghost">
              Verify Flight
            </Link>
            {/* Cart icon linking to /cart (or your checkout/cart page) */}
            <Link href="/checkout/cart" className="relative btn btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.293a1 1 0 00.293 1.414l1.414 1.414a1 1 0 001.414-.293L10 15m0 0l1.293 2.293a1 1 0 001.414.293l1.414-1.414a1 1 0 00.293-1.414L14 15m-7 0h12"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={user.profilePicture || '/default-profile.png'} alt="Profile" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/signup" className="btn btn-ghost">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

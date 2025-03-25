'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import NotificationDropdown from './NotificationDropdown';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

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

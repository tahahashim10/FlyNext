'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-8">
      <h1 className="text-5xl font-bold">Welcome to FlyNext!</h1>
      <p className="text-lg">
        Your most reliable travel companion. Book flights and hotels with ease!
      </p>
      {user ? (
        // If the user is logged in, show a Dashboard link or a welcome message.
        <div className="space-x-4">
          
        </div>
      ) : (
        // If no user is logged in, show Login and Sign Up links.
        <div className="space-x-4">
          <Link href="/login">
            <button className="btn btn-primary">Login</button>
          </Link>
          <Link href="/signup">
            <button className="btn btn-secondary">Sign Up</button>
          </Link>
        </div>
      )}
    </div>
  );
}

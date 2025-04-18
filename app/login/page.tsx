'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/LoginForm';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // If user is logged in, redirect to home (or dashboard)
      router.push('/');
    }
  }, [user, router]);

  // While checking, you might show a loading indicator
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary"></div>
          <p className="mt-4 text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Login</h1>
                <p className="mt-4 text-lg max-w-2xl">
                  Access your travel account and continue your journey
                </p>
              </div>
              <LogIn className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Login Form Container */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <LoginForm />
          </div>

          {/* Additional Context - Updated to use Next.js Link */}
          <div className="text-center mt-6 text-sm text-muted">
            Don't have an account? {' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/LoginForm';

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
    return <p>Redirecting...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}

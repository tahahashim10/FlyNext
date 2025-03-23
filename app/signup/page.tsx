'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import SignupForm from '../../components/SignupForm';

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (user) {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignupForm />
    </div>
  );
}

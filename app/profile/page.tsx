'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../components/ProfileForm';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ProfileForm user={user} />
    </div>
  );
}
 
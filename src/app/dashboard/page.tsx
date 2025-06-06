'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import PageLayout from '@/components/layout/PageLayout';
import Header from '@/components/layout/Header';
import GameProgressCards from '@/components/dashboard/GameProgressCards';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while checking auth
  if (!isInitialized) {
    return null;
  }

  // Redirect happening
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <PageLayout>
      <Header />
      <GameProgressCards user={user} />
      <QuickActions />
    </PageLayout>
  );
}
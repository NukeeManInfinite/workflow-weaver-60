import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SellerDashboard } from '@/pages/seller/SellerDashboard';
import { DirectorDashboard } from './DirectorDashboard';
import { ProductionManagerDashboard } from '@/pages/production';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  console.log('DashboardPage - user:', user, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No user data available. Please login.</p>
      </div>
    );
  }

  // Render role-specific dashboards
  if (user.role === 'Seller') {
    return <SellerDashboard />;
  }

  if (user.role === 'ProductionManager') {
    return <ProductionManagerDashboard />;
  }

  // Director and other roles use the new Director dashboard style
  return <DirectorDashboard />;
};
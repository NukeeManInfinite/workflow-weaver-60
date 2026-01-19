import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, RecentActivity, PendingItems } from '@/components/seller';
import { sellerService } from '@/services/sellerService';
import { StatCardData, ActivityItem, PendingItem } from '@/types/seller';
import { Skeleton } from '@/components/ui/skeleton';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData, pendingData] = await Promise.all([
          sellerService.getDashboardStats(),
          sellerService.getRecentActivities(),
          sellerService.getPendingItems(),
        ]);

        setStats(sellerService.transformStatsToCards(statsData));
        setActivities(activitiesData);
        setPendingItems(pendingData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePendingItemClick = (item: PendingItem) => {
    console.log('Pending item clicked:', item);
    // TODO: Navigate to relevant page based on item type
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Loading Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Loading Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </div>

      {/* Activity and Pending Items Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={activities} />
        <PendingItems items={pendingItems} onItemClick={handlePendingItemClick} />
      </div>
    </div>
  );
};

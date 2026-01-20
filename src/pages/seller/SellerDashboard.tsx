import React, { useEffect, useState } from 'react';
import { StatCard, RecentActivity, PendingItems } from '@/components/seller';
import { sellerService } from '@/services/sellerService';
import { StatCardData, ActivityItem, PendingItem } from '@/types/seller';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch all data in parallel
      const statsPromise = sellerService.getDashboardStats()
        .then((statsData) => {
          setStats(sellerService.transformStatsToCards(statsData));
        })
        .catch((err) => {
          console.error('Failed to fetch dashboard stats:', err);
          toast({
            title: 'Error',
            description: 'Failed to load dashboard statistics',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingStats(false));

      const activitiesPromise = sellerService.getRecentActivities(10)
        .then((activitiesData) => {
          setActivities(activitiesData);
        })
        .catch((err) => {
          console.error('Failed to fetch activities:', err);
        })
        .finally(() => setIsLoadingActivities(false));

      const pendingPromise = sellerService.getPendingItems()
        .then((pendingData) => {
          // Sort by createdAt DESC
          const sorted = [...pendingData].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPendingItems(sorted);
        })
        .catch((err) => {
          console.error('Failed to fetch pending items:', err);
        })
        .finally(() => setIsLoadingPending(false));

      await Promise.allSettled([statsPromise, activitiesPromise, pendingPromise]);
    };

    fetchDashboardData();
  }, []);

  const handlePendingItemClick = (item: PendingItem) => {
    console.log('Pending item clicked:', item);
    // TODO: Navigate to relevant page based on item type
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : stats.length > 0 ? (
          stats.map((stat) => (
            <StatCard key={stat.id} data={stat} />
          ))
        ) : (
          <div className="col-span-4 flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            Unable to load statistics
          </div>
        )}
      </div>

      {/* Activity and Pending Items Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingActivities ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : (
          <RecentActivity activities={activities} />
        )}
        
        {isLoadingPending ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : (
          <PendingItems items={pendingItems} onItemClick={handlePendingItemClick} />
        )}
      </div>
    </div>
  );
};

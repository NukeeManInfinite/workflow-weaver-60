import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StatCard, RecentActivity, PendingItems } from '@/components/seller';
import { sellerService } from '@/services/sellerService';
import { StatCardData, ActivityItem, PendingItem } from '@/types/seller';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidDate } from '@/lib/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleDisplayName } from '@/config/navigation';

export const SellerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingStats(true);
      setIsLoadingActivities(true);
      setIsLoadingPending(true);
    }

    // Fetch all data in parallel
    const statsPromise = sellerService.getDashboardStats()
      .then((statsData) => {
        setStats(sellerService.transformStatsToCards(statsData));
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard stats:', err);
        if (!isRefresh) {
          toast({
            title: t('common.error'),
            description: t('errors.statsLoadFailed'),
            variant: 'destructive',
          });
        }
      })
      .finally(() => setIsLoadingStats(false));

    const activitiesPromise = sellerService.getRecentActivities(10)
      .then((activitiesData) => {
        console.log('📋 RAW ACTIVITIES DATA:', JSON.stringify(activitiesData, null, 2));
        const validActivities = (activitiesData || []).filter(a => a !== null && a !== undefined);
        setActivities(validActivities);
      })
      .catch((err) => {
        console.error('Failed to fetch activities:', err);
      })
      .finally(() => setIsLoadingActivities(false));

    const pendingPromise = sellerService.getPendingItems()
      .then((pendingData) => {
        console.log('📌 RAW PENDING ITEMS DATA:', JSON.stringify(pendingData, null, 2));
        const validItems = (pendingData || []).filter(item => item !== null && item !== undefined);
        const sorted = validItems.sort((a, b) => {
          const dateA = a.createdAt && isValidDate(a.createdAt) ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt && isValidDate(b.createdAt) ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setPendingItems(sorted);
      })
      .catch((err) => {
        console.error('Failed to fetch pending items:', err);
      })
      .finally(() => setIsLoadingPending(false));

    await Promise.allSettled([statsPromise, activitiesPromise, pendingPromise]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title={`Welcome back, ${user?.firstName || 'User'}!`}
        description={`${user ? getRoleDisplayName(user.role) : ''} Dashboard`}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header with refresh button */}
        <div className="flex items-center justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('common.loading') : t('common.refresh') || 'Refresh'}
          </Button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : stats.length > 0 ? (
            stats.map((stat) => (
              <StatCard key={stat.id} data={stat} />
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t('dashboard.statsError')}
            </div>
          )}
        </div>

        {/* Activity and Pending Items Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{t('activity.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{t('activity.subtitle')}</p>
                </div>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-sm text-info hover:text-info/80 font-medium flex items-center gap-1 transition-colors"
                >
                  {t('common.seeMore') || 'See more'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingActivities ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <RecentActivity activities={activities} />
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{t('pending.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{t('pending.subtitle')}</p>
                </div>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-sm text-info hover:text-info/80 font-medium flex items-center gap-1 transition-colors"
                >
                  {t('common.seeMore') || 'See more'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingPending ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <PendingItems items={pendingItems} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ChevronRight,
  Clock,
  Package,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { getRoleDisplayName } from '@/config/navigation';

interface StatData {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href?: string;
}

interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: 'order' | 'contract' | 'task' | 'material';
}

interface PendingItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
  href?: string;
}

export const DirectorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    // Simulate loading from API
    const loadData = async () => {
      setIsLoading(true);
      
      // In production, these would be API calls
      setTimeout(() => {
        setStats([
          {
            title: 'Total Contracts',
            value: '156',
            trend: '+12 this month',
            trendUp: true,
            icon: FileText,
            color: 'text-info',
            bgColor: 'bg-info/10',
            href: '/contracts'
          },
          {
            title: 'Active Orders',
            value: '34',
            icon: ShoppingCart,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            href: '/orders'
          },
          {
            title: 'Employees',
            value: '87',
            icon: Users,
            color: 'text-success',
            bgColor: 'bg-success/10',
            href: '/employees'
          },
          {
            title: 'Monthly Revenue',
            value: '$1.2M',
            trend: '+8%',
            trendUp: true,
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            href: '/kpi-dashboard'
          }
        ]);

        setActivities([
          { id: '1', message: 'Order #ORD-2024-015 created', time: '5 minutes ago', type: 'order' },
          { id: '2', message: 'Dimensions updated for Category A', time: '1 hour ago', type: 'task' },
          { id: '3', message: 'Task assigned to John Doe', time: '2 hours ago', type: 'task' },
          { id: '4', message: 'Material request approved', time: '3 hours ago', type: 'material' },
        ]);

        setPendingItems([
          { id: '1', title: 'Review order dimensions', priority: 'high', due: 'Today', href: '/orders' },
          { id: '2', title: 'Approve material request', priority: 'medium', due: 'Tomorrow', href: '/material-requests' },
          { id: '3', title: 'Assign tasks to team', priority: 'medium', due: 'This week', href: '/tasks' },
          { id: '4', title: 'Update inventory count', priority: 'low', due: 'This week', href: '/inventory' },
        ]);

        setIsLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'contract': return FileText;
      case 'material': return Package;
      case 'task': return CheckSquare;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-muted-foreground';
      default: return 'bg-muted';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title={`Welcome back, ${user.firstName}!`}
        description={`${getRoleDisplayName(user.role)} Dashboard`}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border border-border/50 bg-card hover:shadow-elevated transition-all duration-300 cursor-pointer"
                  onClick={() => stat.href && navigate(stat.href)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                        {stat.trend && (
                          <p className={`text-xs font-medium ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                            {stat.trend}
                          </p>
                        )}
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              );
            })
          )}
        </div>

        {/* Activity and Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border border-border/50 bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Your latest actions and updates</p>
                </div>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-sm text-info hover:text-info/80 font-medium flex items-center gap-1 transition-colors"
                >
                  See more
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{activity.message}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Items */}
          <Card className="border border-border/50 bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Pending Items</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Items requiring your attention</p>
                </div>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-sm text-info hover:text-info/80 font-medium flex items-center gap-1 transition-colors"
                >
                  See more
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckSquare className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {pendingItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => item.href && navigate(item.href)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(item.priority)}`} />
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.due}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

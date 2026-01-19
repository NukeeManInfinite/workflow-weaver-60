import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ShoppingCart, 
  Users, 
  CheckSquare, 
  Package, 
  TrendingUp, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { getRoleDisplayName } from '@/config/navigation';

// Mock statistics data - in real app this would come from API
const getStatsForRole = (role: string) => {
  const roleStats: Record<string, { title: string; value: string; icon: React.ElementType; trend?: string; color: string }[]> = {
    Seller: [
      { title: 'Active Contracts', value: '12', icon: FileText, trend: '+2 this week', color: 'text-info' },
      { title: 'Pending Orders', value: '8', icon: ShoppingCart, trend: '+3 today', color: 'text-warning' },
      { title: 'Completed Orders', value: '45', icon: CheckSquare, color: 'text-success' },
      { title: 'Total Revenue', value: '$125,400', icon: TrendingUp, trend: '+15%', color: 'text-primary' },
    ],
    Director: [
      { title: 'Total Contracts', value: '156', icon: FileText, trend: '+12 this month', color: 'text-info' },
      { title: 'Active Orders', value: '34', icon: ShoppingCart, color: 'text-warning' },
      { title: 'Employees', value: '87', icon: Users, color: 'text-success' },
      { title: 'Monthly Revenue', value: '$1.2M', icon: TrendingUp, trend: '+8%', color: 'text-primary' },
    ],
    Constructor: [
      { title: 'Orders to Review', value: '6', icon: ShoppingCart, color: 'text-warning' },
      { title: 'Dimensions Set', value: '23', icon: CheckSquare, trend: '+5 today', color: 'text-success' },
      { title: 'Material Requests', value: '8', icon: Package, trend: '3 pending', color: 'text-info' },
      { title: 'Avg. Completion Time', value: '2.5 days', icon: Clock, color: 'text-muted-foreground' },
    ],
    ProductionManager: [
      { title: 'Active Categories', value: '18', icon: ShoppingCart, color: 'text-warning' },
      { title: 'Team Leaders', value: '5', icon: Users, color: 'text-info' },
      { title: 'Total Employees', value: '45', icon: Users, color: 'text-success' },
      { title: 'Pending Assignments', value: '7', icon: AlertTriangle, color: 'text-warning' },
    ],
    TeamLeader: [
      { title: 'Assigned Categories', value: '4', icon: ShoppingCart, color: 'text-info' },
      { title: 'Tasks Created', value: '28', icon: CheckSquare, color: 'text-warning' },
      { title: 'Tasks Completed', value: '19', icon: CheckSquare, trend: '+6 today', color: 'text-success' },
      { title: 'Team Members', value: '8', icon: Users, color: 'text-primary' },
    ],
    Employee: [
      { title: 'Assigned Tasks', value: '5', icon: CheckSquare, color: 'text-warning' },
      { title: 'Completed Today', value: '3', icon: CheckSquare, color: 'text-success' },
      { title: 'Productivity Score', value: '94%', icon: TrendingUp, trend: '+2%', color: 'text-info' },
      { title: 'Avg. Task Time', value: '45 min', icon: Clock, color: 'text-muted-foreground' },
    ],
    WarehouseManager: [
      { title: 'Total Items', value: '1,234', icon: Package, color: 'text-info' },
      { title: 'Low Stock Alerts', value: '12', icon: AlertTriangle, color: 'text-destructive' },
      { title: 'Pending Requests', value: '8', icon: ShoppingCart, color: 'text-warning' },
      { title: 'Stock Value', value: '$89,500', icon: TrendingUp, color: 'text-success' },
    ],
  };
  return roleStats[role] || [];
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const stats = getStatsForRole(user.role);

  return (
    <div className="min-h-screen">
      <AppHeader 
        title={`Welcome back, ${user.firstName}!`}
        description={`${getRoleDisplayName(user.role)} Dashboard`}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-dashboard">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.trend && (
                        <p className="text-xs text-success">{stat.trend}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Order #ORD-2024-015 created', time: '5 minutes ago' },
                  { action: 'Dimensions updated for Category A', time: '1 hour ago' },
                  { action: 'Task assigned to John Doe', time: '2 hours ago' },
                  { action: 'Material request approved', time: '3 hours ago' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{item.action}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Items</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { item: 'Review order dimensions', priority: 'high', due: 'Today' },
                  { item: 'Approve material request', priority: 'medium', due: 'Tomorrow' },
                  { item: 'Assign tasks to team', priority: 'medium', due: 'This week' },
                  { item: 'Update inventory count', priority: 'low', due: 'This week' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        item.priority === 'high' ? 'bg-destructive' :
                        item.priority === 'medium' ? 'bg-warning' : 'bg-muted'
                      }`} />
                      <span className="text-sm">{item.item}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.due}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

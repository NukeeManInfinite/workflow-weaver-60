import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';

// Sample data - in production, this would come from API
const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 32 },
  { month: 'Feb', revenue: 52000, orders: 41 },
  { month: 'Mar', revenue: 48000, orders: 38 },
  { month: 'Apr', revenue: 61000, orders: 55 },
  { month: 'May', revenue: 55000, orders: 48 },
  { month: 'Jun', revenue: 67000, orders: 62 },
  { month: 'Jul', revenue: 72000, orders: 68 },
  { month: 'Aug', revenue: 69000, orders: 58 },
  { month: 'Sep', revenue: 81000, orders: 75 },
  { month: 'Oct', revenue: 78000, orders: 71 },
  { month: 'Nov', revenue: 85000, orders: 82 },
  { month: 'Dec', revenue: 92000, orders: 89 },
];

const productionData = [
  { category: 'Furniture', completed: 120, inProgress: 45, pending: 23 },
  { category: 'Doors', completed: 85, inProgress: 32, pending: 18 },
  { category: 'Windows', completed: 67, inProgress: 28, pending: 15 },
  { category: 'Kitchen', completed: 43, inProgress: 22, pending: 12 },
  { category: 'Custom', completed: 28, inProgress: 15, pending: 8 },
];

const statusDistribution = [
  { name: 'Completed', value: 45, color: 'hsl(142, 71%, 45%)' },
  { name: 'In Progress', value: 30, color: 'hsl(199, 89%, 48%)' },
  { name: 'Pending', value: 15, color: 'hsl(38, 92%, 50%)' },
  { name: 'Cancelled', value: 10, color: 'hsl(0, 72%, 51%)' },
];

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon: Icon, color }) => (
  <Card className="border border-border/50">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-success' : 'text-destructive'}`}>
            {changeType === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change} vs last month
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const KPIDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="KPI Dashboard"
        description="Performance metrics and analytics"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <KPICard 
                title="Total Revenue" 
                value="$892,450" 
                change="+12.5%" 
                changeType="up"
                icon={DollarSign}
                color="bg-success/10 text-success"
              />
              <KPICard 
                title="Total Orders" 
                value="1,247" 
                change="+8.2%" 
                changeType="up"
                icon={ShoppingCart}
                color="bg-info/10 text-info"
              />
              <KPICard 
                title="Production Output" 
                value="892 units" 
                change="+15.3%" 
                changeType="up"
                icon={Package}
                color="bg-warning/10 text-warning"
              />
              <KPICard 
                title="Employee Productivity" 
                value="94.2%" 
                change="-2.1%" 
                changeType="down"
                icon={Users}
                color="bg-primary/10 text-primary"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Monthly Revenue & Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(199, 89%, 48%)" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Production by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" name="Completed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" fill="hsl(199, 89%, 48%)" name="In Progress" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" name="Pending" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={140}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KPIDashboardPage;

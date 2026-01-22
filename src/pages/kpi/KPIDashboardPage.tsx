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
import { TrendingUp, TrendingDown, Package, Users, ClipboardList, CheckSquare } from 'lucide-react';
import { 
  productionManagerService, 
  ProductionKPI, 
  ProductionChartData, 
  CategoryProductionData, 
  StatusDistribution 
} from '@/services/productionManagerService';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon: Icon, color, loading }) => (
  <Card className="border border-border/50">
    <CardContent className="p-5">
      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
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
      )}
    </CardContent>
  </Card>
);

const defaultStatusColors: Record<string, string> = {
  'Completed': 'hsl(142, 71%, 45%)',
  'In Progress': 'hsl(199, 89%, 48%)',
  'Pending': 'hsl(38, 92%, 50%)',
  'Cancelled': 'hsl(0, 72%, 51%)',
};

export const KPIDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [kpi, setKpi] = useState<ProductionKPI | null>(null);
  const [chartData, setChartData] = useState<ProductionChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryProductionData[]>([]);
  const [statusData, setStatusData] = useState<StatusDistribution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [kpiData, productionChart, categoryProduction, statusDistribution] = await Promise.all([
          productionManagerService.getProductionKPI(),
          productionManagerService.getProductionChartData(),
          productionManagerService.getCategoryProductionData(),
          productionManagerService.getStatusDistribution(),
        ]);

        setKpi(kpiData);
        setChartData(productionChart);
        setCategoryData(categoryProduction);
        // Ensure colors are set
        setStatusData(statusDistribution.map(item => ({
          ...item,
          color: item.color || defaultStatusColors[item.name] || 'hsl(var(--muted))'
        })));
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChange = (value: number): string => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const renderEmptyChart = (message: string) => (
    <div className="h-80 flex items-center justify-center">
      <div className="text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Production KPI Dashboard"
        description="Production metrics and analytics"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard 
            title="Total Orders" 
            value={kpi?.totalOrders.toString() || '0'} 
            change={formatChange(kpi?.ordersChange || 0)}
            changeType={(kpi?.ordersChange || 0) >= 0 ? 'up' : 'down'}
            icon={ClipboardList}
            color="bg-info/10 text-info"
            loading={isLoading}
          />
          <KPICard 
            title="Orders in Production" 
            value={kpi?.ordersInProduction.toString() || '0'} 
            change={formatChange(kpi?.ordersChange || 0)}
            changeType={(kpi?.ordersChange || 0) >= 0 ? 'up' : 'down'}
            icon={Package}
            color="bg-warning/10 text-warning"
            loading={isLoading}
          />
          <KPICard 
            title="Production Output" 
            value={`${kpi?.productionOutput || 0} units`} 
            change={formatChange(kpi?.outputChange || 0)}
            changeType={(kpi?.outputChange || 0) >= 0 ? 'up' : 'down'}
            icon={CheckSquare}
            color="bg-success/10 text-success"
            loading={isLoading}
          />
          <KPICard 
            title="Employee Productivity" 
            value={`${kpi?.employeeProductivity || 0}%`} 
            change={formatChange(kpi?.productivityChange || 0)}
            changeType={(kpi?.productivityChange || 0) >= 0 ? 'up' : 'down'}
            icon={Users}
            color="bg-primary/10 text-primary"
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="production" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="production">Production Trends</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-4">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Monthly Orders & Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : chartData.length === 0 ? (
                  renderEmptyChart('No production data available')
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
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
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="orders" 
                        name="Orders"
                        stroke="hsl(199, 89%, 48%)" 
                        fillOpacity={1} 
                        fill="url(#colorOrders)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        name="Completed"
                        stroke="hsl(142, 71%, 45%)" 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Production by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80" />
                ) : categoryData.length === 0 ? (
                  renderEmptyChart('No category data available')
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryData}>
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
                ) : statusData.length === 0 ? (
                  renderEmptyChart('No status data available')
                ) : (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={140}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
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

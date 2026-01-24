import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  CheckSquare, 
  Clock, 
  Building2,
  Target
} from 'lucide-react';
import { CompanyKPI } from '@/services/kpiService';
import { KPICard } from './KPICard';

interface DirectorKPIViewProps {
  companyKpi: CompanyKPI | null;
  loading: boolean;
}

const defaultStatusColors: Record<string, string> = {
  'Completed': 'hsl(142, 71%, 45%)',
  'InProgress': 'hsl(199, 89%, 48%)',
  'In Progress': 'hsl(199, 89%, 48%)',
  'Pending': 'hsl(38, 92%, 50%)',
  'Created': 'hsl(217, 91%, 60%)',
  'Cancelled': 'hsl(0, 72%, 51%)',
  'Delayed': 'hsl(0, 72%, 51%)',
};

export const DirectorKPIView: React.FC<DirectorKPIViewProps> = ({ companyKpi, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!companyKpi) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-10 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Company Data</h3>
          <p className="text-muted-foreground">
            Company-wide KPI data is not available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare task status data with colors
  const statusDataWithColors = companyKpi.taskStatusDistribution.map((item) => ({
    ...item,
    color: item.color || defaultStatusColors[item.status] || 'hsl(var(--muted))',
  }));

  return (
    <div className="space-y-6">
      {/* Company KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Employees"
          value={companyKpi.totalEmployees.toString()}
          subtitle={`${companyKpi.activeEmployees} active`}
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <KPICard
          title="Company Productivity"
          value={`${companyKpi.companyProductivity.toFixed(1)}%`}
          subtitle="Overall efficiency"
          icon={TrendingUp}
          color="bg-success/10 text-success"
        />
        <KPICard
          title="Tasks Completed"
          value={companyKpi.totalTasksCompleted.toString()}
          subtitle={`${companyKpi.totalTasksPending} pending`}
          icon={CheckSquare}
          color="bg-info/10 text-info"
        />
        <KPICard
          title="Average Efficiency"
          value={`${companyKpi.averageEfficiency.toFixed(1)}%`}
          subtitle="Across all teams"
          icon={Target}
          color="bg-warning/10 text-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trends */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {companyKpi.productivityTrends.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={companyKpi.productivityTrends}>
                  <defs>
                    <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Productivity"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorProductivity)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDataWithColors.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No status data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDataWithColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percentage }) => `${status} ${percentage.toFixed(0)}%`}
                  >
                    {statusDataWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companyKpi.departmentComparison.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">No department data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={companyKpi.departmentComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="departmentName" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="completedTasks" 
                  name="Completed" 
                  fill="hsl(142, 71%, 45%)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="pendingTasks" 
                  name="Pending" 
                  fill="hsl(38, 92%, 50%)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="productivity" 
                  name="Productivity %" 
                  fill="hsl(199, 89%, 48%)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectorKPIView;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Clock, Target, Award, TrendingUp } from 'lucide-react';
import { MyKPI } from '@/services/kpiService';
import { KPICard } from './KPICard';

interface EmployeeKPIViewProps {
  kpi: MyKPI | null;
  loading: boolean;
}

export const EmployeeKPIView: React.FC<EmployeeKPIViewProps> = ({ kpi, loading }) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!kpi) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-10 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No KPI Data</h3>
          <p className="text-muted-foreground">
            Your performance data is not available yet. Complete some tasks to see your KPI.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Completed Tasks"
          value={`${kpi.completedTasks}/${kpi.totalTasks}`}
          subtitle={`${kpi.period}`}
          icon={CheckSquare}
          color="bg-success/10 text-success"
        />
        <KPICard
          title="Efficiency"
          value={`${kpi.efficiency.toFixed(1)}%`}
          subtitle="Task completion rate"
          icon={TrendingUp}
          color="bg-info/10 text-info"
        />
        <KPICard
          title="On-Time Completion"
          value={`${kpi.onTimeCompletion.toFixed(1)}%`}
          subtitle="Delivered on schedule"
          icon={Clock}
          color="bg-warning/10 text-warning"
        />
        <KPICard
          title="Performance Score"
          value={`${kpi.performanceScore.toFixed(0)}`}
          subtitle="Overall rating"
          icon={Award}
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Performance Overview */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Efficiency Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Efficiency</span>
              <span className={`font-medium ${getPerformanceColor(kpi.efficiency)}`}>
                {kpi.efficiency.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={kpi.efficiency} 
              className="h-2"
            />
          </div>

          {/* On-Time Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">On-Time Delivery</span>
              <span className={`font-medium ${getPerformanceColor(kpi.onTimeCompletion)}`}>
                {kpi.onTimeCompletion.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={kpi.onTimeCompletion} 
              className="h-2"
            />
          </div>

          {/* Performance Score Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Performance Score</span>
              <span className={`font-medium ${getPerformanceColor(kpi.performanceScore)}`}>
                {kpi.performanceScore.toFixed(0)}/100
              </span>
            </div>
            <Progress 
              value={kpi.performanceScore} 
              className="h-2"
            />
          </div>

          {/* Average Task Time */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Average Task Time</span>
              </div>
              <span className="font-medium">
                {kpi.averageTaskTime > 60 
                  ? `${(kpi.averageTaskTime / 60).toFixed(1)} hrs`
                  : `${kpi.averageTaskTime.toFixed(0)} min`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeKPIView;

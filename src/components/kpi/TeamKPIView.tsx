import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TeamKPI, Team } from '@/services/kpiService';
import { KPICard } from './KPICard';

interface TeamKPIViewProps {
  teamKpi: TeamKPI | null;
  teams: Team[];
  selectedTeamId: number | null;
  onTeamChange: (teamId: number) => void;
  loading: boolean;
}

export const TeamKPIView: React.FC<TeamKPIViewProps> = ({
  teamKpi,
  teams,
  selectedTeamId,
  onTeamChange,
  loading,
}) => {
  if (loading && !teamKpi) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground">Select Team:</label>
        <Select
          value={selectedTeamId?.toString() || ''}
          onValueChange={(value) => onTeamChange(parseInt(value))}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name} ({team.memberCount} members)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTeamId ? (
        <Card className="border border-border/50">
          <CardContent className="p-10 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Team</h3>
            <p className="text-muted-foreground">
              Choose a team from the dropdown above to view their KPI data.
            </p>
          </CardContent>
        </Card>
      ) : !teamKpi ? (
        <Card className="border border-border/50">
          <CardContent className="p-10 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Team Data</h3>
            <p className="text-muted-foreground">
              No KPI data available for this team yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Team KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              title="Team Productivity"
              value={`${teamKpi.teamProductivity.toFixed(1)}%`}
              subtitle={`${teamKpi.totalMembers} team members`}
              icon={TrendingUp}
              color="bg-primary/10 text-primary"
              loading={loading}
            />
            <KPICard
              title="Average Efficiency"
              value={`${teamKpi.averageEfficiency.toFixed(1)}%`}
              subtitle="Team average"
              icon={Users}
              color="bg-info/10 text-info"
              loading={loading}
            />
            <KPICard
              title="On-Time Tasks"
              value={teamKpi.onTimeTasks.toString()}
              subtitle={`vs ${teamKpi.delayedTasks} delayed`}
              icon={CheckCircle}
              color="bg-success/10 text-success"
              loading={loading}
            />
            <KPICard
              title="Delayed Tasks"
              value={teamKpi.delayedTasks.toString()}
              subtitle="Needs attention"
              icon={Clock}
              color="bg-destructive/10 text-destructive"
              loading={loading}
            />
          </div>

          {/* Performance Over Time Chart */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle>Team Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {teamKpi.performanceOverTime.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={teamKpi.performanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
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
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Performance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Team Member Performance */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle>Team Member Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {teamKpi.memberPerformance.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No member data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={teamKpi.memberPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="employeeName" 
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
                      name="Completed Tasks" 
                      fill="hsl(142, 71%, 45%)" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="efficiency" 
                      name="Efficiency %" 
                      fill="hsl(199, 89%, 48%)" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TeamKPIView;

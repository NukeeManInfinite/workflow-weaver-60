import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, ClipboardList, Building2, ChevronRight, Package } from 'lucide-react';
import { productionManagerService, ProductionDashboardStats, TeamLeader, CategoryAssignment } from '@/services/productionManagerService';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, loading }) => (
  <Card className="border border-border/50">
    <CardContent className="p-5">
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export const ProductionManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProductionDashboardStats | null>(null);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [pendingCategories, setPendingCategories] = useState<CategoryAssignment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, leaders, categories] = await Promise.all([
          productionManagerService.getDashboardStats(),
          productionManagerService.getTeamLeaders(),
          productionManagerService.getCategoriesToAssign(),
        ]);
        setStats(dashboardStats);
        setTeamLeaders(leaders.slice(0, 5)); // Show top 5
        setPendingCategories(categories.filter(c => !c.assignedTeamLeaderId).slice(0, 5)); // Show pending only
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderEmptyState = (message: string) => (
    <div className="p-8 text-center">
      <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Production Manager Dashboard"
        description="Overview of your production management"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={Users}
            color="bg-primary/10 text-primary"
            loading={loading}
          />
          <StatCard
            title="Active Employees"
            value={stats?.activeEmployees || 0}
            icon={UserCheck}
            color="bg-success/10 text-success"
            loading={loading}
          />
          <StatCard
            title="Team Leaders"
            value={stats?.teamLeaders || 0}
            icon={Users}
            color="bg-info/10 text-info"
            loading={loading}
          />
          <StatCard
            title="Departments"
            value={stats?.departments || 0}
            icon={Building2}
            color="bg-warning/10 text-warning"
            loading={loading}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border border-border/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/assignments')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10 text-warning">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Assignments</p>
                    {loading ? (
                      <Skeleton className="h-8 w-12 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.pendingAssignments || 0}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/assignments')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Categories</p>
                    {loading ? (
                      <Skeleton className="h-8 w-12 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.assignedCategories || 0}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Categories */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Assignments</CardTitle>
                <CardDescription>Categories waiting for team leader assignment</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                {pendingCategories.length} pending
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-b-0">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : pendingCategories.length === 0 ? (
                renderEmptyState('All categories are assigned')
              ) : (
                pendingCategories.map((category, index) => (
                  <div 
                    key={category.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer ${index !== pendingCategories.length - 1 ? 'border-b' : ''}`}
                    onClick={() => navigate('/assignments')}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{category.categoryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.orderNumber} • {category.customerName}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      Unassigned
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Team Leaders */}
          <Card className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Leaders</CardTitle>
                <CardDescription>Your team leaders and their active assignments</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-info/10 text-info">
                {teamLeaders.length} leaders
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-b-0">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : teamLeaders.length === 0 ? (
                renderEmptyState('No team leaders found')
              ) : (
                teamLeaders.map((leader, index) => (
                  <div 
                    key={leader.id}
                    className={`flex items-center justify-between p-4 ${index !== teamLeaders.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{leader.fullName}</p>
                        <p className="text-sm text-muted-foreground">{leader.department}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{leader.activeAssignments} active</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductionManagerDashboard;

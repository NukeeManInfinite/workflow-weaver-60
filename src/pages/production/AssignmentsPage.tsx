import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, Users, ChevronRight, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  productionManagerService, 
  CategoryAssignment, 
  TeamLeader, 
  AssignmentStats 
} from '@/services/productionManagerService';

export const AssignmentsPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryAssignment[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    pendingAssignments: 0,
    assignedCategories: 0,
    teamLeadersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaders, setSelectedLeaders] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, teamLeadersData, statsData] = await Promise.all([
        productionManagerService.getCategoriesToAssign(),
        productionManagerService.getTeamLeaders(),
        productionManagerService.getAssignmentStats(),
      ]);
      setCategories(categoriesData);
      setTeamLeaders(teamLeadersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (categoryId: number) => {
    const teamLeaderId = selectedLeaders[categoryId];
    if (!teamLeaderId) {
      toast({
        title: 'Error',
        description: 'Please select a team leader',
        variant: 'destructive',
      });
      return;
    }

    setAssigningId(categoryId);
    try {
      await productionManagerService.assignCategoryToTeamLeader(categoryId, teamLeaderId);
      toast({
        title: 'Success',
        description: 'Category assigned successfully',
      });
      // Refresh data
      await fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign category',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Categories Available</h3>
        <p className="text-muted-foreground">
          There are no categories ready for assignment at this time.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Category Assignments"
        description="Assign categories to team leaders"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-warning">{stats.pendingAssignments}</div>
                  <div className="text-sm text-muted-foreground">Pending Assignments</div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-info">{stats.assignedCategories}</div>
                  <div className="text-sm text-muted-foreground">Assigned Categories</div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{stats.teamLeadersCount}</div>
                  <div className="text-sm text-muted-foreground">Team Leaders</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search categories..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories to Assign */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Categories Ready for Assignment</h2>
            
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredCategories.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{category.categoryName}</h3>
                          {category.assignedTeamLeaderId ? (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning">
                              Unassigned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.orderNumber} • {category.customerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {category.assignedTeamLeaderName ? (
                          <div className="text-sm text-right">
                            <p className="text-muted-foreground">Assigned to</p>
                            <p className="font-medium">{category.assignedTeamLeaderName}</p>
                          </div>
                        ) : (
                          <Select
                            value={selectedLeaders[category.id]?.toString() || ''}
                            onValueChange={(value) => 
                              setSelectedLeaders(prev => ({ ...prev, [category.id]: parseInt(value) }))
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select Team Leader" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamLeaders.map((leader) => (
                                <SelectItem key={leader.id} value={leader.id.toString()}>
                                  {leader.fullName} ({leader.activeAssignments})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {!category.assignedTeamLeaderId && (
                          <Button 
                            size="sm"
                            onClick={() => handleAssign(category.id)}
                            disabled={assigningId === category.id || !selectedLeaders[category.id]}
                          >
                            {assigningId === category.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="mr-2 h-4 w-4" />
                            )}
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Team Leaders Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Team Leaders</h2>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))
                ) : teamLeaders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">No team leaders found</p>
                  </div>
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{leader.activeAssignments} active</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

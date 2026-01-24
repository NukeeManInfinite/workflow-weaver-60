import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  UserCheck, 
  Users, 
  ChevronRight, 
  Loader2, 
  Play, 
  CheckCircle2, 
  Trash2,
  Clock,
  AlertCircle,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  categoryAssignmentService, 
  CategoryAssignment, 
  TeamLeader
} from '@/services/categoryAssignmentService';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<CategoryAssignment[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState<number | null>(null);

  // Derived stats from assignments (single source of truth)
  const stats = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) {
      return {
        pendingAssignments: 0,
        inProgressAssignments: 0,
        completedAssignments: 0,
        totalAssignments: 0,
        teamLeadersCount: 0,
      };
    }
    
    const pendingCount = assignments.filter(a => a?.status === 'Pending').length;
    const inProgressCount = assignments.filter(a => a?.status === 'InProgress').length;
    const completedCount = assignments.filter(a => a?.status === 'Completed').length;
    
    // Count unique team leaders from assignments
    const uniqueLeaderIds = new Set<number>();
    assignments.forEach(a => {
      if (a?.teamLeaderId) uniqueLeaderIds.add(a.teamLeaderId);
    });
    
    return {
      pendingAssignments: pendingCount,
      inProgressAssignments: inProgressCount,
      completedAssignments: completedCount,
      totalAssignments: assignments.length,
      teamLeadersCount: uniqueLeaderIds.size || teamLeaders.length,
    };
  }, [assignments, teamLeaders]);

  // Filter assignments by status
  const pendingAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];
    return assignments.filter(a => a?.status === 'Pending');
  }, [assignments]);

  const activeAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];
    return assignments.filter(a => a?.status === 'InProgress' || a?.status === 'Pending');
  }, [assignments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only call existing APIs
      const [assignmentsData, teamLeadersData] = await Promise.all([
        categoryAssignmentService.getAll(),
        categoryAssignmentService.getTeamLeaders(),
      ]);
      
      // Ensure data is valid before setting state
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setTeamLeaders(Array.isArray(teamLeadersData) ? teamLeadersData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
      // Set empty arrays on error
      setAssignments([]);
      setTeamLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStart = async (assignmentId: number) => {
    setActionLoading(assignmentId);
    try {
      await categoryAssignmentService.start(assignmentId);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Ish boshlandi',
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Ishni boshlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (assignmentId: number) => {
    setActionLoading(assignmentId);
    try {
      await categoryAssignmentService.complete(assignmentId);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Ish yakunlandi',
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Ishni yakunlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    setActionLoading(assignmentId);
    try {
      await categoryAssignmentService.delete(assignmentId);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Tayinlov o\'chirildi',
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Tayinlovni o\'chirishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setDeleteConfirmId(null);
    }
  };

  const getStatusBadge = (status: CategoryAssignment['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning"><Clock className="h-3 w-3 mr-1" />Kutilmoqda</Badge>;
      case 'InProgress':
        return <Badge variant="outline" className="bg-info/10 text-info"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Jarayonda</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-success/10 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Yakunlangan</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive"><AlertCircle className="h-3 w-3 mr-1" />Bekor qilingan</Badge>;
      default:
        return <Badge variant="outline">{status || 'Noma\'lum'}</Badge>;
    }
  };

  // Safe search with null guards
  const filteredPendingAssignments = useMemo(() => {
    if (!pendingAssignments || pendingAssignments.length === 0) return [];
    if (!searchTerm) return pendingAssignments;
    
    const term = searchTerm.toLowerCase();
    return pendingAssignments.filter((a) => {
      if (!a) return false;
      return (
        (a.categoryName?.toLowerCase() || '').includes(term) ||
        (a.orderNumber?.toLowerCase() || '').includes(term) ||
        (a.customerName?.toLowerCase() || '').includes(term)
      );
    });
  }, [pendingAssignments, searchTerm]);

  const filteredActiveAssignments = useMemo(() => {
    if (!activeAssignments || activeAssignments.length === 0) return [];
    if (!searchTerm) return activeAssignments;
    
    const term = searchTerm.toLowerCase();
    return activeAssignments.filter((a) => {
      if (!a) return false;
      return (
        (a.categoryName?.toLowerCase() || '').includes(term) ||
        (a.orderNumber?.toLowerCase() || '').includes(term) ||
        (a.customerName?.toLowerCase() || '').includes(term)
      );
    });
  }, [activeAssignments, searchTerm]);

  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Kategoriya Tayinlovlari"
        description="Kategoriyalarni jamoa rahbarlariga tayinlash"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-warning">{stats.pendingAssignments}</div>
                  <div className="text-sm text-muted-foreground">Kutilayotgan</div>
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
                  <div className="text-2xl font-bold text-info">{stats.inProgressAssignments}</div>
                  <div className="text-sm text-muted-foreground">Jarayonda</div>
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
                  <div className="text-2xl font-bold text-success">{stats.completedAssignments}</div>
                  <div className="text-sm text-muted-foreground">Yakunlangan</div>
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
                  <div className="text-2xl font-bold text-primary">{stats.totalAssignments}</div>
                  <div className="text-sm text-muted-foreground">Jami Tayinlovlar</div>
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
                  <div className="text-2xl font-bold text-secondary-foreground">{stats.teamLeadersCount}</div>
                  <div className="text-sm text-muted-foreground">Jamoa Rahbarlari</div>
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
              placeholder="Tayinlovlarni qidirish..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Assignments (Ready for work) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Tayinlash uchun Kategoriyalar</h2>
            
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredPendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Kategoriyalar Mavjud Emas</h3>
                  <p className="text-muted-foreground">
                    Hozirda tayinlash uchun kategoriyalar yo'q.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPendingAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{assignment.categoryName || assignment.orderNumber || 'Noma\'lum'}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assignment.orderNumber || '-'} • {assignment.customerName || '-'}
                        </p>
                        {assignment.teamLeaderName && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Rahbar: </span>
                            <span className="font-medium">{assignment.teamLeaderName}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStart(assignment.id)}
                          disabled={actionLoading === assignment.id}
                        >
                          {actionLoading === assignment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Boshlash
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(assignment.id)}
                          disabled={actionLoading === assignment.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Active Assignments (In Progress) */}
            <h2 className="text-lg font-semibold mt-8">Faol Tayinlovlar</h2>
            
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredActiveAssignments.filter(a => a?.status === 'InProgress').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Faol Tayinlovlar Yo'q</h3>
                  <p className="text-muted-foreground">
                    Hozirda jarayondagi tayinlovlar mavjud emas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredActiveAssignments
                .filter(a => a?.status === 'InProgress')
                .map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{assignment.categoryName || assignment.orderNumber || 'Noma\'lum'}</h3>
                            {getStatusBadge(assignment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.orderNumber || '-'} • {assignment.customerName || '-'}
                          </p>
                          {assignment.teamLeaderName && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Rahbar: </span>
                              <span className="font-medium">{assignment.teamLeaderName}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success border-success hover:bg-success/10"
                            onClick={() => handleComplete(assignment.id)}
                            disabled={actionLoading === assignment.id}
                          >
                            {actionLoading === assignment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Yakunlash
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirmId(assignment.id)}
                            disabled={actionLoading === assignment.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>

          {/* Team Leaders Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Jamoa Rahbarlari</h2>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))
                ) : !teamLeaders || teamLeaders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">Jamoa rahbarlari topilmadi</p>
                  </div>
                ) : (
                  teamLeaders.map((leader, index) => (
                    <div 
                      key={leader?.id || index}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTeamLeaderId === leader?.id ? 'bg-primary/10' : ''
                      } ${index !== teamLeaders.length - 1 ? 'border-b' : ''}`}
                      onClick={() => setSelectedTeamLeaderId(
                        selectedTeamLeaderId === leader?.id ? null : leader?.id
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{leader?.fullName || 'Noma\'lum'}</p>
                          <p className="text-sm text-muted-foreground">{leader?.department || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={(leader?.activeAssignments || 0) > 0 ? 'default' : 'secondary'}>
                          {leader?.activeAssignments || 0} aktiv
                        </Badge>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tayinlovni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham bu tayinlovni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {actionLoading === deleteConfirmId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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
  Package,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  TeamLeader, 
  AssignmentStats,
  CategoryForAssignment,
  OrderForAssignment
} from '@/services/categoryAssignmentService';
import { notificationService } from '@/services/notificationService';
import { format } from 'date-fns';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<CategoryAssignment[]>([]);
  const [categoriesForAssignment, setCategoriesForAssignment] = useState<CategoryForAssignment[]>([]);
  const [ordersForAssignment, setOrdersForAssignment] = useState<OrderForAssignment[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    pendingAssignments: 0,
    inProgressAssignments: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    teamLeadersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Multi-select state for orders
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState<number | null>(null);
  const [assigningOrders, setAssigningOrders] = useState(false);
  
  // Single category assignment state (legacy)
  const [selectedLeaders, setSelectedLeaders] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, categoriesData, ordersData, teamLeadersData] = await Promise.all([
        categoryAssignmentService.getAll(),
        categoryAssignmentService.getCategoriesForAssignment(),
        categoryAssignmentService.getOrdersForAssignment(),
        categoryAssignmentService.getTeamLeaders(),
      ]);
      
      setAssignments(assignmentsData);
      setCategoriesForAssignment(categoriesData.filter(c => !c.isAssigned));
      
      // Filter orders that are not already assigned
      const assignedOrderIds = new Set(assignmentsData.map(a => a.orderId.toString()));
      const unassignedOrders = ordersData.filter(o => !assignedOrderIds.has(o.id));
      setOrdersForAssignment(unassignedOrders);
      
      setTeamLeaders(teamLeadersData);
      setStats(categoryAssignmentService.calculateStats(assignmentsData, teamLeadersData));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Select all orders
  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  // Assign selected orders to team leader
  const handleAssignOrders = async () => {
    if (!selectedTeamLeaderId || selectedOrderIds.size === 0) {
      toast({
        title: 'Xatolik',
        description: 'Iltimos, buyurtmalar va jamoa rahbarini tanlang',
        variant: 'destructive',
      });
      return;
    }

    setAssigningOrders(true);
    try {
      const selectedOrders = ordersForAssignment.filter(o => selectedOrderIds.has(o.id));
      const orderNumbers: string[] = [];
      
      // Create assignments for each selected order
      for (const order of selectedOrders) {
        await categoryAssignmentService.createOrderAssignment({
          orderId: parseInt(order.id),
          teamLeaderId: selectedTeamLeaderId,
        });
        orderNumbers.push(order.orderNumber);
      }
      
      // Send notification to team leader
      await notificationService.sendAssignmentNotification(selectedTeamLeaderId, orderNumbers);
      
      toast({
        title: 'Muvaffaqiyat',
        description: `${selectedOrderIds.size} ta buyurtma muvaffaqiyatli tayinlandi`,
      });
      
      // Clear selections and refresh
      setSelectedOrderIds(new Set());
      setSelectedTeamLeaderId(null);
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Buyurtmalarni tayinlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setAssigningOrders(false);
    }
  };

  const handleAssign = async (categoryId: number) => {
    const teamLeaderId = selectedLeaders[categoryId];
    if (!teamLeaderId) {
      toast({
        title: 'Xatolik',
        description: 'Iltimos, jamoa rahbarini tanlang',
        variant: 'destructive',
      });
      return;
    }

    setAssigningId(categoryId);
    try {
      await categoryAssignmentService.create({
        categoryId,
        teamLeaderId,
      });
      toast({
        title: 'Muvaffaqiyat',
        description: 'Kategoriya muvaffaqiyatli tayinlandi',
      });
      // Clear selection and refresh
      setSelectedLeaders(prev => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Kategoriyani tayinlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Created':
        return <Badge variant="outline" className="bg-warning/10 text-warning">Yaratilgan</Badge>;
      case 'InProgress':
        return <Badge variant="outline" className="bg-info/10 text-info">Jarayonda</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-success/10 text-success">Yakunlangan</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">Bekor qilingan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCategories = categoriesForAssignment.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = ordersForAssignment.filter((order) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine categories and orders for display
  const hasItemsToAssign = filteredCategories.length > 0 || filteredOrders.length > 0;

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
              placeholder="Buyurtmalarni qidirish..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders & Categories to Assign */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tayinlash uchun Buyurtmalar</h2>
              {filteredOrders.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {selectedOrderIds.size} / {filteredOrders.length} tanlangan
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedOrderIds.size === filteredOrders.length ? 'Bekor qilish' : 'Hammasini tanlash'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Assignment action bar - show when orders are selected */}
            {selectedOrderIds.size > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm">
                        {selectedOrderIds.size} ta buyurtma tanlandi
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={selectedTeamLeaderId?.toString() || ''}
                        onValueChange={(value) => setSelectedTeamLeaderId(parseInt(value))}
                      >
                        <SelectTrigger className="w-56 bg-background">
                          <SelectValue placeholder="Jamoa rahbarini tanlang" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {teamLeaders.map((leader) => (
                            <SelectItem key={leader.id} value={leader.id.toString()}>
                              {leader.fullName} ({leader.activeAssignments} aktiv)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAssignOrders}
                        disabled={assigningOrders || !selectedTeamLeaderId}
                      >
                        {assigningOrders ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="mr-2 h-4 w-4" />
                        )}
                        Tayinlash
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : !hasItemsToAssign ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Buyurtmalar Mavjud Emas</h3>
                  <p className="text-muted-foreground">
                    Hozirda tayinlash uchun buyurtmalar yo'q.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Orders list with checkboxes */}
                {filteredOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedOrderIds.has(order.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleOrderSelection(order.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={selectedOrderIds.has(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{order.orderNumber}</h3>
                              {getOrderStatusBadge(order.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(order.createdAt), 'dd.MM.yyyy')}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Mijoz: <span className="text-foreground">{order.customerName}</span>
                          </p>
                          {order.categoryNames && (
                            <p className="text-sm text-muted-foreground">
                              Kategoriyalar: <span className="text-foreground">
                                {Array.isArray(order.categoryNames) 
                                  ? order.categoryNames.join(', ') 
                                  : order.categoryNames}
                              </span>
                            </p>
                          )}
                          {(order.constructorName || order.productionManagerName) && (
                            <div className="flex gap-4 text-sm">
                              {order.constructorName && (
                                <span className="text-muted-foreground">
                                  Konstruktor: <span className="text-foreground">{order.constructorName}</span>
                                </span>
                              )}
                              {order.productionManagerName && (
                                <span className="text-muted-foreground">
                                  PM: <span className="text-foreground">{order.productionManagerName}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Legacy categories if any */}
                {filteredCategories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{category.name}</h3>
                            <Badge variant="outline" className="bg-warning/10 text-warning">
                              Tayinlanmagan
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {category.orderNumber} • {category.customerName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={selectedLeaders[category.id]?.toString() || ''}
                            onValueChange={(value) => 
                              setSelectedLeaders(prev => ({ ...prev, [category.id]: parseInt(value) }))
                            }
                          >
                            <SelectTrigger className="w-48 bg-background">
                              <SelectValue placeholder="Rahbar tanlang" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              {teamLeaders.map((leader) => (
                                <SelectItem key={leader.id} value={leader.id.toString()}>
                                  {leader.fullName} ({leader.activeAssignments} aktiv)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            Tayinlash
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Active Assignments */}
            <h2 className="text-lg font-semibold mt-8">Faol Tayinlovlar</h2>
            
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tayinlovlar Yo'q</h3>
                  <p className="text-muted-foreground">
                    Hozirda faol tayinlovlar mavjud emas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{assignment.categoryName || assignment.orderNumber}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assignment.orderNumber} • {assignment.customerName}
                        </p>
                        {assignment.teamLeaderName && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Rahbar: </span>
                            <span className="font-medium">{assignment.teamLeaderName}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.status === 'Pending' && (
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
                        )}
                        {assignment.status === 'InProgress' && (
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
                        )}
                        {(assignment.status === 'Pending' || assignment.status === 'InProgress') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirmId(assignment.id)}
                            disabled={actionLoading === assignment.id}
                          >
                            <Trash2 className="h-4 w-4" />
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
            <h2 className="text-lg font-semibold">Jamoa Rahbarlari</h2>
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
                    <p className="text-muted-foreground text-sm">Jamoa rahbarlari topilmadi</p>
                  </div>
                ) : (
                  teamLeaders.map((leader, index) => (
                    <div 
                      key={leader.id}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTeamLeaderId === leader.id ? 'bg-primary/10' : ''
                      } ${index !== teamLeaders.length - 1 ? 'border-b' : ''}`}
                      onClick={() => setSelectedTeamLeaderId(
                        selectedTeamLeaderId === leader.id ? null : leader.id
                      )}
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
                        <Badge variant={leader.activeAssignments > 0 ? 'default' : 'secondary'}>
                          {leader.activeAssignments} aktiv
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

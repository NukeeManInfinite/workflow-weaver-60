import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/services/orders.api';
import { Order, OrderStats, OrderStatus, CreateOrderDto, UpdateOrderDto } from '@/types/order';
import {
  OrdersTable,
  OrderFormModal,
  OrderViewModal,
  AssignModal,
  DeleteOrderModal,
} from '@/components/orders';

export const OrdersPage: React.FC = () => {
  const { toast } = useToast();

  // State for orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // State for stats
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Query params state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignConstructorModalOpen, setAssignConstructorModalOpen] = useState(false);
  const [assignManagerModalOpen, setAssignManagerModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await ordersApi.getStats();
      setStats(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
    }
  }, [toast]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const params: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (searchQuery.trim()) {
        params.SearchTerm = searchQuery.trim();
      }

      if (statusFilter !== 'all') {
        params.Status = statusFilter;
      }

      const response = await ordersApi.getOrders(params);
      setOrders(Array.isArray(response?.items) ? response.items : []);
      setTotalCount(response?.totalCount || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load orders',
        variant: 'destructive',
      });
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoadingOrders(false);
    }
  }, [pageNumber, pageSize, searchQuery, statusFilter, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleNewOrder = () => {
    setSelectedOrder(null);
    setFormModalOpen(true);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormModalOpen(true);
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  const handleAssignConstructor = (order: Order) => {
    setSelectedOrder(order);
    setAssignConstructorModalOpen(true);
  };

  const handleAssignProductionManager = (order: Order) => {
    setSelectedOrder(order);
    setAssignManagerModalOpen(true);
  };

  // Form submit
  const handleFormSubmit = async (data: CreateOrderDto | UpdateOrderDto) => {
    setSubmitting(true);
    try {
      if (selectedOrder) {
        await ordersApi.update(selectedOrder.id, data as UpdateOrderDto);
        toast({ title: 'Success', description: 'Order updated successfully' });
      } else {
        await ordersApi.create(data as CreateOrderDto);
        toast({ title: 'Success', description: 'Order created successfully' });
      }
      setFormModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await ordersApi.delete(selectedOrder.id);
      toast({ title: 'Success', description: 'Order deleted successfully' });
      setDeleteModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Assign constructor
  const handleAssignConstructorSubmit = async (userId: string) => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await ordersApi.assignConstructor(selectedOrder.id, { constructorId: Number(userId) });
      toast({ title: 'Success', description: 'Constructor assigned successfully' });
      setAssignConstructorModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to assign constructor',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Assign production manager
  const handleAssignManagerSubmit = async (userId: string) => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await ordersApi.assignProductionManager(selectedOrder.id, { productionManagerId: Number(userId) });
      toast({ title: 'Success', description: 'Production manager assigned successfully' });
      setAssignManagerModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to assign production manager',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const canPrevious = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Orders"
        description="Manage and track all orders"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.totalOrders ?? 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Plus className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-warning">{stats?.created ?? 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <Filter className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-info">{stats?.inProgress ?? 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Search className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-success">{stats?.completed ?? 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <ChevronRight className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value as OrderStatus | 'all');
                        setPageNumber(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Created">Created</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleNewOrder}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Orders Table */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTable
              orders={orders}
              loading={loadingOrders}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssignConstructor={handleAssignConstructor}
              onAssignProductionManager={handleAssignProductionManager}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pageNumber - 1) * pageSize) + 1} to{' '}
                  {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} orders
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(p => p - 1)}
                    disabled={!canPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pageNumber} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(p => p + 1)}
                    disabled={!canNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <OrderViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <OrderFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleFormSubmit}
        order={selectedOrder}
        loading={submitting}
      />

      <DeleteOrderModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        order={selectedOrder}
        loading={submitting}
      />

      <AssignModal
        open={assignConstructorModalOpen}
        onClose={() => {
          setAssignConstructorModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAssignConstructorSubmit}
        order={selectedOrder}
        type="constructor"
        loading={submitting}
      />

      <AssignModal
        open={assignManagerModalOpen}
        onClose={() => {
          setAssignManagerModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAssignManagerSubmit}
        order={selectedOrder}
        type="productionManager"
        loading={submitting}
      />
    </div>
  );
};

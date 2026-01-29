import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { ConstructorOrder } from '@/types/constructor';
import {
  Search,
  Clock,
  Tag,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

type StatusFilter = 'all' | 'waiting' | 'inProgress' | 'returned' | 'completed' | 'delayed';

// Normalize backend status to consistent format
const normalizeStatus = (status: string): string => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'pending' || statusLower === 'created' || statusLower === 'assigned') return 'Pending';
  if (statusLower === 'inprogress' || statusLower === 'in_progress') return 'InProgress';
  if (statusLower === 'completed' || statusLower === 'senttowarehouse') return 'Completed';
  if (statusLower === 'returned' || statusLower === 'requiresremeasurement') return 'Returned';
  if (statusLower === 'delayed') return 'Delayed';
  return status;
};

const getStatusInfo = (status: string) => {
  const normalized = normalizeStatus(status);
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; bgColor: string; textColor: string }> = {
    Pending: { label: 'Kutilmoqda', variant: 'outline', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    InProgress: { label: 'Jarayonda', variant: 'default', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    Completed: { label: 'Tayyor', variant: 'secondary', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    Returned: { label: 'Qaytarilgan', variant: 'destructive', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    Delayed: { label: 'Kechikkan', variant: 'destructive', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  };
  
  return statusMap[normalized] || statusMap.Pending;
};

const getDeadlineInfo = (deadline?: string) => {
  if (!deadline) return null;
  
  try {
    const deadlineDate = parseISO(deadline);
    const daysLeft = differenceInDays(deadlineDate, new Date());
    
    if (daysLeft < 0) {
      return { text: `${Math.abs(daysLeft)} kun kechikdi`, color: 'text-destructive', bgColor: 'bg-destructive', isDelayed: true };
    } else if (daysLeft === 0) {
      return { text: 'Bugun', color: 'text-warning', bgColor: 'bg-warning', isDelayed: false };
    } else if (daysLeft <= 3) {
      return { text: `${daysLeft} kun qoldi`, color: 'text-warning', bgColor: 'bg-warning', isDelayed: false };
    }
    return { text: format(deadlineDate, 'dd/MM/yyyy'), color: 'text-muted-foreground', bgColor: '', isDelayed: false };
  } catch {
    return null;
  }
};

const getActionButton = (status: string) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'Pending':
      return { label: 'Ishni boshlash', color: 'bg-primary hover:bg-primary/90' };
    case 'InProgress':
      return { label: 'Davom ettirish', color: 'bg-green-500 hover:bg-green-600' };
    case 'Returned':
      return { label: 'Qayta ishlash', color: 'bg-orange-500 hover:bg-orange-600' };
    case 'Completed':
      return { label: 'Ko\'rish', color: 'bg-blue-500 hover:bg-blue-600' };
    default:
      return { label: 'Davom ettirish', color: 'bg-primary hover:bg-primary/90' };
  }
};

// Extract category names from order - handles multiple backend formats
const getCategoryNames = (order: ConstructorOrder): string => {
  // Priority 1: categories array with objects containing name
  if (Array.isArray(order.categories) && order.categories.length > 0) {
    const names = order.categories
      .map(c => c?.name)
      .filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  
  // Priority 2: categoryNames as array
  if (Array.isArray(order.categoryNames) && order.categoryNames.length > 0) {
    return order.categoryNames.filter(Boolean).join(', ');
  }
  
  // Priority 3: categoryNames as string
  if (typeof order.categoryNames === 'string' && order.categoryNames.trim()) {
    return order.categoryNames;
  }
  
  // Priority 4: single categoryName
  if (order.categoryName && order.categoryName.trim()) {
    return order.categoryName;
  }
  
  // Priority 5: furnitureTypes names
  if (Array.isArray(order.furnitureTypes) && order.furnitureTypes.length > 0) {
    const names = order.furnitureTypes
      .map(ft => ft?.name)
      .filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  
  return 'Kategoriya belgilanmagan';
};

export const ConstructorOrdersPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ConstructorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await constructorService.getOrders();
      console.log('Constructor orders response:', data);
      
      // Backend already filters by current constructor, just ensure array
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Buyurtmalarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders based on search and status
  const getFilteredOrders = () => {
    let filtered = orders.filter(order => {
      const search = searchTerm.toLowerCase();
      const categoryName = getCategoryNames(order).toLowerCase();
      
      return (
        order.orderNumber?.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.contractNumber?.toLowerCase().includes(search) ||
        categoryName.includes(search)
      );
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const normalized = normalizeStatus(order.status);
        const deadlineInfo = getDeadlineInfo(order.deadline);
        
        switch (statusFilter) {
          case 'waiting':
            return normalized === 'Pending';
          case 'inProgress':
            return normalized === 'InProgress';
          case 'returned':
            return normalized === 'Returned';
          case 'completed':
            return normalized === 'Completed';
          case 'delayed':
            return deadlineInfo?.isDelayed || normalized === 'Delayed';
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats from filtered orders list
  const stats = {
    waiting: orders.filter(o => normalizeStatus(o.status) === 'Pending').length,
    inProgress: orders.filter(o => normalizeStatus(o.status) === 'InProgress').length,
    completed: orders.filter(o => normalizeStatus(o.status) === 'Completed').length,
    returned: orders.filter(o => normalizeStatus(o.status) === 'Returned').length,
    delayed: orders.filter(o => {
      const deadlineInfo = getDeadlineInfo(o.deadline);
      return deadlineInfo?.isDelayed || normalizeStatus(o.status) === 'Delayed';
    }).length,
  };

  const statusTabs = [
    { key: 'all', label: 'Hammasi', count: orders.length },
    { key: 'waiting', label: 'Kutilmoqda', count: stats.waiting, icon: Clock },
    { key: 'inProgress', label: 'Jarayonda', count: stats.inProgress, icon: Tag },
    { key: 'returned', label: 'Qaytarilgan', count: stats.returned, icon: RotateCcw },
    { key: 'completed', label: 'Tayyor', count: stats.completed, icon: CheckCircle },
  ];

  const handleOrderClick = (orderId: number) => {
    navigate(`/constructor/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Konstruktor"
        description="Buyurtmalar uchun razmerlar va materiallarni kiriting"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-400">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.waiting}</div>
                  <div className="text-sm text-muted-foreground">Kutilmoqda</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">Jarayonda</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Tayyor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.returned}</div>
                  <div className="text-sm text-muted-foreground">Qaytarilgan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.delayed}</div>
                  <div className="text-sm text-muted-foreground">Kechikkan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buyurtma, mijoz yoki kategoriya qidirish..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map(tab => (
              <Button
                key={tab.key}
                variant={statusFilter === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(tab.key as StatusFilter)}
                className={`gap-2 ${statusFilter === tab.key ? '' : 'text-muted-foreground'}`}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
                <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Order Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center text-muted-foreground">
                <Tag className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Buyurtmalar topilmadi</h3>
                <p className="text-sm text-center max-w-sm">
                  {searchTerm
                    ? "Qidiruv bo'yicha hech narsa topilmadi."
                    : "Sizga hali hech qanday buyurtma tayinlanmagan."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const deadlineInfo = getDeadlineInfo(order.deadline);
              const actionButton = getActionButton(order.status);
              
              // Get counts from categories or furnitureTypes
              const furnitureCount = order.categories?.length || order.furnitureTypes?.length || 0;
              const drawingsCount = order.furnitureTypes?.reduce((acc, ft) => acc + (ft.drawingsCount || 0), 0) || 0;
              const completedCount = order.furnitureTypes?.filter(ft => ft.isCompleted).length || 0;
              
              // Use centralized category name extraction
              const categoryName = getCategoryNames(order);
              
              // Defensive customer name resolution
              const customerDisplayName = order.customerName || order.contractNumber || `Buyurtma #${order.id}`;
              
              // Order number display - show formatted or raw
              const orderDisplayNumber = (() => {
                if (order.orderNumber) {
                  // If format is like "ORD-2024-0001", show last segment
                  const parts = order.orderNumber.split('-');
                  return parts.length > 1 ? parts[parts.length - 1] : order.orderNumber;
                }
                return String(order.id).padStart(4, '0');
              })();

              return (
                <Card 
                  key={order.id} 
                  className="hover:shadow-md transition-shadow border bg-card"
                >
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-primary font-bold text-lg">
                            #{orderDisplayNumber}
                          </span>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {customerDisplayName}
                          </p>
                        </div>
                        <Badge className={`shrink-0 ${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Category Badge */}
                      <Badge variant="outline" className="rounded-md font-normal">
                        {categoryName}
                      </Badge>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mebel turlari:</span>
                          <span className="font-medium">{furnitureCount} ta</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rasmlar:</span>
                          <span className="font-medium flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> {drawingsCount} ta
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Deadline:</span>
                          <div className="flex items-center gap-2">
                            {deadlineInfo ? (
                              <>
                                <span className={`font-medium ${deadlineInfo.color}`}>
                                  {order.deadline ? format(parseISO(order.deadline), 'dd/MM/yyyy') : '-'}
                                </span>
                                {deadlineInfo.isDelayed && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                    {deadlineInfo.text}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="font-medium">-</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bajarildi</span>
                          <span className="font-medium">{completedCount}/{furnitureCount}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className={`w-full ${actionButton.color} text-white`}
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {actionButton.label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

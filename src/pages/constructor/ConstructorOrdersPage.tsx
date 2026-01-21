import React, { useState, useEffect, useCallback } from 'react';
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
import { OrderCard } from '@/components/constructor';
import {
  Search,
  RefreshCw,
  ClipboardList,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ConstructorOrdersPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [orders, setOrders] = useState<ConstructorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await constructorService.getOrders();
      
      // DEFENSIVE FILTERING: Only show orders assigned to current constructor
      const filteredData = (data || []).filter(order => {
        // Check if order is assigned to current user
        const isAssignedToMe = 
          order.constructorId === Number(user?.id) ||
          order.constructorName?.toLowerCase().includes(user?.firstName?.toLowerCase() || '') ||
          order.constructorName?.toLowerCase().includes(user?.lastName?.toLowerCase() || '');
        
        return isAssignedToMe;
      });
      
      setOrders(filteredData);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Xatolik',
        description: 'Buyurtmalarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(search) ||
      order.customerName?.toLowerCase().includes(search) ||
      order.contractNumber?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'InProgress' || o.status === 'Assigned').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    pending: orders.filter(o => o.status === 'Created' || o.status === 'Assigned').length,
  };

  const handleCategoryComplete = async (furnitureTypeId: number) => {
    try {
      await constructorService.completeFurnitureType(furnitureTypeId);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Kategoriya ishlab chiqarishga yuborildi',
      });
      loadOrders();
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Kategoriyani tugatishda xatolik',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Mening buyurtmalarim"
        description="Sizga tayinlangan buyurtmalar va kategoriyalar"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Jami buyurtmalar</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">Kutilmoqda</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">Jarayonda</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-success">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Tugatilgan</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buyurtma yoki mijoz qidirish..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full max-w-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredOrders.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center text-muted-foreground">
                  <ClipboardList className="h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Buyurtmalar topilmadi</h3>
                  <p className="text-sm text-center max-w-sm">
                    {searchTerm
                      ? "Qidiruv bo'yicha hech narsa topilmadi. Boshqa kalit so'z bilan urinib ko'ring."
                      : "Sizga hali hech qanday buyurtma tayinlanmagan."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Order cards
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCategoryComplete={handleCategoryComplete}
                onRefresh={loadOrders}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

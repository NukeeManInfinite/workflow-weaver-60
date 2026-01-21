import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { ConstructorOrder, FurnitureType, ConstructorStats } from '@/types/constructor';
import {
  Package,
  Ruler,
  FileImage,
  FileText,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}> = ({ title, value, icon: Icon, color, loading }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const getOrderStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Created: 'bg-muted text-muted-foreground',
    InProgress: 'bg-info/10 text-info',
    Completed: 'bg-success/10 text-success',
    Cancelled: 'bg-destructive/10 text-destructive',
  };
  return (
    <Badge className={variants[status] || variants.Created}>
      {status}
    </Badge>
  );
};

export const ConstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [stats, setStats] = useState<ConstructorStats | null>(null);
  const [orders, setOrders] = useState<ConstructorOrder[]>([]);
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, furnitureData] = await Promise.all([
        constructorService.getStats(),
        constructorService.getOrders(),
        constructorService.getFurnitureTypes(),
      ]);

      setStats(statsData);
      setOrders(ordersData || []);
      setFurnitureTypes(furnitureData || []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from data if API stats are zeros
  const calculatedStats: ConstructorStats = stats || {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'InProgress').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    totalFurnitureTypes: furnitureTypes.length,
    completedFurnitureTypes: furnitureTypes.filter(f => f.isCompleted).length,
    pendingFurnitureTypes: furnitureTypes.filter(f => !f.isCompleted).length,
    totalDetails: furnitureTypes.reduce((sum, f) => sum + (f.details?.length || 0), 0),
    totalDrawings: furnitureTypes.reduce((sum, f) => sum + (f.drawings?.length || 0), 0),
  };

  // Use calculated stats if API returned zeros
  const displayStats = stats && stats.totalOrders === 0 && orders.length > 0 
    ? calculatedStats 
    : (stats || calculatedStats);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);
  
  // Pending furniture types
  const pendingFurnitureTypes = furnitureTypes.filter(f => !f.isCompleted).slice(0, 5);

  return (
    <div className="min-h-screen">
      <AppHeader
        title={`Xush kelibsiz, ${user ? `${user.firstName} ${user.lastName}` : 'Konstruktor'}!`}
        description="Konstruktor boshqaruv paneli"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Jami buyurtmalar"
            value={displayStats.totalOrders}
            icon={ClipboardList}
            color="bg-primary/10 text-primary"
            loading={loading}
          />
          <StatCard
            title="Faol buyurtmalar"
            value={displayStats.activeOrders}
            icon={Clock}
            color="bg-info/10 text-info"
            loading={loading}
          />
          <StatCard
            title="Mebel turlari"
            value={displayStats.totalFurnitureTypes}
            icon={Package}
            color="bg-warning/10 text-warning"
            loading={loading}
          />
          <StatCard
            title="Tugatilgan"
            value={displayStats.completedFurnitureTypes}
            icon={CheckCircle}
            color="bg-success/10 text-success"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/constructor/orders')}
          >
            <ClipboardList className="h-6 w-6 text-primary" />
            <span>Buyurtmalar</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/constructor/furniture-types')}
          >
            <Package className="h-6 w-6 text-info" />
            <span>Mebel turlari</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/constructor/details')}
          >
            <Ruler className="h-6 w-6 text-warning" />
            <span>Detallar</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/constructor/drawings')}
          >
            <FileImage className="h-6 w-6 text-success" />
            <span>Chizmalar</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">So'nggi buyurtmalar</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/constructor/orders')}
              >
                Barchasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mb-2 opacity-50" />
                  <p>Hozircha buyurtmalar yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/constructor/orders/${order.id}`)}
                    >
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerName}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Furniture Types */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tugallanmagan mebel turlari</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/constructor/furniture-types')}
              >
                Barchasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingFurnitureTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mb-2 opacity-50 text-success" />
                  <p>Barcha mebel turlari tugallangan!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFurnitureTypes.map(ft => (
                    <div
                      key={ft.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/constructor/furniture-types/${ft.id}`)}
                    >
                      <div>
                        <div className="font-medium">{ft.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            {ft.details?.length || 0} detal
                          </span>
                          <span className="flex items-center gap-1">
                            <FileImage className="h-3 w-3" />
                            {ft.drawings?.length || 0} chizma
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Jarayonda
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {!loading && pendingFurnitureTypes.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <span className="font-medium">Diqqat: </span>
                  <span className="text-muted-foreground">
                    Sizda {pendingFurnitureTypes.length} ta tugallanmagan mebel turi mavjud. 
                    Texnik xususiyatlarni to'ldiring va tugallang.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { constructorService } from '@/services/constructorService';
import { ConstructorOrder } from '@/types/constructor';
import {
  Search,
  MoreHorizontal,
  Eye,
  Package,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Created: 'bg-muted text-muted-foreground',
    InProgress: 'bg-info/10 text-info',
    Completed: 'bg-success/10 text-success',
    Cancelled: 'bg-destructive/10 text-destructive',
  };
  
  const labels: Record<string, string> = {
    Created: 'Yaratilgan',
    InProgress: 'Jarayonda',
    Completed: 'Tugatilgan',
    Cancelled: 'Bekor qilingan',
  };
  
  return (
    <Badge className={variants[status] || variants.Created}>
      {labels[status] || status}
    </Badge>
  );
};

export const ConstructorOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<ConstructorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await constructorService.getOrders();
      setOrders(data || []);
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
  }, [toast]);

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
    created: orders.filter(o => o.status === 'Created').length,
    inProgress: orders.filter(o => o.status === 'InProgress').length,
    completed: orders.filter(o => o.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Mening buyurtmalarim"
        description="Sizga tayinlangan buyurtmalar ro'yxati"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Jami buyurtmalar</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.created}</div>
              <div className="text-sm text-muted-foreground">Yaratilgan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">Jarayonda</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Tugatilgan</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buyurtma qidirish..."
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

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyurtma №</TableHead>
                  <TableHead>Shartnoma №</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Mebel turlari</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ClipboardList className="h-10 w-10 mb-2 opacity-50" />
                        <p>Buyurtmalar topilmadi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.contractNumber || '-'}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{order.furnitureTypes?.length || 0} ta</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/constructor/orders/${order.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ko'rish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

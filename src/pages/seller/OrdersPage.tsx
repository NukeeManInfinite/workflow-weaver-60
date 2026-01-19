import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Filter, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockOrders = [
  { id: '1', orderNumber: 'ORD-2024-001', contractNumber: 'CTR-2024-001', customerName: 'ABC Manufacturing', status: 'InProgress', totalAmount: 15000, createdAt: '2024-01-16', categories: 3 },
  { id: '2', orderNumber: 'ORD-2024-002', contractNumber: 'CTR-2024-001', customerName: 'ABC Manufacturing', status: 'Created', totalAmount: 20000, createdAt: '2024-01-17', categories: 2 },
  { id: '3', orderNumber: 'ORD-2024-003', contractNumber: 'CTR-2024-002', customerName: 'XYZ Industries', status: 'Completed', totalAmount: 35000, createdAt: '2024-01-18', categories: 5 },
  { id: '4', orderNumber: 'ORD-2024-004', contractNumber: 'CTR-2024-002', customerName: 'XYZ Industries', status: 'InProgress', totalAmount: 28000, createdAt: '2024-01-19', categories: 4 },
  { id: '5', orderNumber: 'ORD-2024-005', contractNumber: 'CTR-2024-005', customerName: 'Prime Products', status: 'Created', totalAmount: 18000, createdAt: '2024-01-22', categories: 2 },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Created: 'status-badge status-pending',
    InProgress: 'status-badge status-active',
    Completed: 'status-badge status-completed',
    Cancelled: 'status-badge status-error',
  };
  return <span className={variants[status] || 'status-badge'}>{status}</span>;
};

export const OrdersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Orders"
        description="Manage and track all orders"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">48</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">15</div>
              <div className="text-sm text-muted-foreground">Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">21</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">12</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{order.contractNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.categories}</TableCell>
                    <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

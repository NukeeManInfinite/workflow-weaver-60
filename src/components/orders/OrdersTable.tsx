import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, Settings } from 'lucide-react';
import { Order } from '@/types/order';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onAssignConstructor: (order: Order) => void;
  onAssignProductionManager: (order: Order) => void;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Created: 'status-badge status-pending',
    InProgress: 'status-badge status-active',
    Completed: 'status-badge status-completed',
    Cancelled: 'status-badge status-error',
  };
  return <span className={variants[status] || 'status-badge'}>{status}</span>;
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  onView,
  onEdit,
  onDelete,
  onAssignConstructor,
  onAssignProductionManager,
}) => {
  if (loading) {
    return (
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
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders available.
      </div>
    );
  }

  return (
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
        {orders.map((order, index) => {
          // Format category names
          const categoryDisplay = order.categoryNames
            ? Array.isArray(order.categoryNames)
              ? order.categoryNames.join(', ')
              : order.categoryNames
            : order.categoryName || '-';

          return (
          <TableRow key={`${order.id}-${index}`}>
            <TableCell className="font-medium">{order.orderNumber || '-'}</TableCell>
            <TableCell className="text-muted-foreground">{order.contractNumber || '-'}</TableCell>
            <TableCell>{order.customerName || '-'}</TableCell>
            <TableCell className="max-w-[200px] truncate" title={categoryDisplay}>
              {categoryDisplay}
            </TableCell>
            <TableCell>${(order.totalAmount || 0).toLocaleString()}</TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(order)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(order)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAssignConstructor(order)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Constructor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssignProductionManager(order)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Assign Production Manager
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(order)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types/order';
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Package, 
  UserCog, 
  Wrench,
  MapPin,
  Phone,
  Hash,
  ClipboardList,
  StickyNote
} from 'lucide-react';

interface OrderViewModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'InProgress':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatCurrency = (amount?: number): string => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

const formatCategories = (order: Order): string => {
  if (order.categoryNames) {
    return Array.isArray(order.categoryNames) 
      ? order.categoryNames.join(', ') 
      : order.categoryNames;
  }
  return order.categoryName || '-';
};

export const OrderViewModal: React.FC<OrderViewModalProps> = ({
  open,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-semibold">{order.orderNumber || '-'}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm px-3 py-1">
              {order.status}
            </Badge>
          </div>

          {/* Contract & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                Contract Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contract #:</span>
                  <span className="font-medium text-sm">{order.contractNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Customer Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium text-sm">{order.customerName || '-'}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone:
                    </span>
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address:
                    </span>
                    <span className="text-sm text-right max-w-[150px]">{order.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              Categories
            </h4>
            <p className="text-sm">{formatCategories(order)}</p>
          </div>

          {/* Assigned Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                Constructor
              </h4>
              <p className={`text-sm ${order.constructorName ? 'font-medium' : 'text-muted-foreground italic'}`}>
                {order.constructorName || 'Not assigned'}
              </p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                <UserCog className="h-4 w-4" />
                Production Manager
              </h4>
              <p className={`text-sm ${order.productionManagerName ? 'font-medium' : 'text-muted-foreground italic'}`}>
                {order.productionManagerName || 'Not assigned'}
              </p>
            </div>
          </div>

          {/* Description & Notes */}
          {(order.description || order.notes) && (
            <>
              <Separator />
              <div className="space-y-4">
                {order.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                      <ClipboardList className="h-4 w-4" />
                      Description
                    </h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-md">{order.description}</p>
                  </div>
                )}
                {order.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                      <StickyNote className="h-4 w-4" />
                      Notes
                    </h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-md">{order.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dates */}
          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created:</span>
              <span className="font-medium text-foreground">{formatDate(order.createdAt)}</span>
            </div>
            {order.updatedAt && (
              <div>
                <span>Updated:</span>
                <span className="font-medium text-foreground ml-1">{formatDate(order.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

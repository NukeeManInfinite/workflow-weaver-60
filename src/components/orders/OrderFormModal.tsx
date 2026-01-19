import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Order, CreateOrderDto, UpdateOrderDto } from '@/types/order';

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderDto | UpdateOrderDto) => Promise<void>;
  order?: Order | null;
  loading: boolean;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  order,
  loading,
}) => {
  const isEdit = !!order;
  
  const [formData, setFormData] = useState({
    contractId: '',
    customerId: '',
    categoryId: '',
    description: '',
    totalAmount: 0,
    notes: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        contractId: order.contractId || '',
        customerId: order.customerId || '',
        categoryId: order.categoryId || '',
        description: order.description || '',
        totalAmount: order.totalAmount || 0,
        notes: order.notes || '',
      });
    } else {
      setFormData({
        contractId: '',
        customerId: '',
        categoryId: '',
        description: '',
        totalAmount: 0,
        notes: '',
      });
    }
  }, [order, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractId">Contract ID *</Label>
                <Input
                  id="contractId"
                  value={formData.contractId}
                  onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                  required
                  placeholder="Enter contract ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID *</Label>
                <Input
                  id="customerId"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                  placeholder="Enter customer ID"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category ID</Label>
                <Input
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  placeholder="Enter category ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter order description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

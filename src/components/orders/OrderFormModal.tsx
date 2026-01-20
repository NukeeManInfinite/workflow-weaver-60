import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Order, CreateOrderDto, UpdateOrderDto, ContractSummary } from '@/types/order';
import { ContractSelector } from './ContractSelector';

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

  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // For edit mode, create a contract summary from order data
      if (order.contractId) {
        setSelectedContract({
          id: order.contractId,
          contractNumber: order.contractNumber || '',
          customerId: order.customerId,
          customerName: order.customerName || '',
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          categoryNames: order.categoryName ? [order.categoryName] : [],
          totalAmount: order.totalAmount,
          status: 'Active',
          isApproved: true,
        });
      }
    } else {
      setFormData({
        contractId: '',
        customerId: '',
        categoryId: '',
        description: '',
        totalAmount: 0,
        notes: '',
      });
      setSelectedContract(null);
    }
    setErrors({});
  }, [order, open]);

  const handleContractChange = (contractId: string, contract: ContractSummary | null) => {
    setSelectedContract(contract);
    setErrors((prev) => ({ ...prev, contractId: '' }));
    
    if (contract) {
      setFormData({
        ...formData,
        contractId: contract.id,
        customerId: contract.customerId,
        totalAmount: contract.totalAmount,
      });
    } else {
      setFormData({
        ...formData,
        contractId: '',
        customerId: '',
        totalAmount: 0,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contractId) {
      newErrors.contractId = 'Please select a contract';
    }

    if (selectedContract && !selectedContract.isApproved) {
      newErrors.contractId = 'Selected contract must be approved';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Contract Selector */}
            <div className="space-y-2">
              <Label htmlFor="contract">Contract *</Label>
              <ContractSelector
                value={formData.contractId}
                onChange={handleContractChange}
                disabled={loading || isEdit}
                error={errors.contractId}
              />
              {isEdit && (
                <p className="text-sm text-muted-foreground">
                  Contract cannot be changed for existing orders
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter order description"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.contractId || (selectedContract && !selectedContract.isApproved)}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
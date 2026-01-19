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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Contract, ContractCreateRequest } from '@/types/contract';
import { Loader2 } from 'lucide-react';

interface ContractFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContractCreateRequest) => Promise<void>;
  contract?: Contract | null;
  loading?: boolean;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  contract,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ContractCreateRequest>({
    customerId: '',
    categoryId: '',
    description: '',
    totalAmount: 0,
    advancePaymentPercentage: 0,
    deadline: '',
    signedDate: '',
    paymentStatus: 'Pending',
    terms: '',
    notes: '',
  });

  const isEditMode = !!contract;

  useEffect(() => {
    if (contract) {
      setFormData({
        customerId: contract.customerId || '',
        categoryId: contract.categoryId || '',
        description: contract.description || '',
        totalAmount: contract.totalAmount || 0,
        advancePaymentPercentage: contract.advancePaymentPercentage || 0,
        deadline: contract.deadline ? contract.deadline.split('T')[0] : '',
        signedDate: contract.signedDate ? contract.signedDate.split('T')[0] : '',
        paymentStatus: contract.paymentStatus || 'Pending',
        terms: contract.terms || '',
        notes: contract.notes || '',
      });
    } else {
      setFormData({
        customerId: '',
        categoryId: '',
        description: '',
        totalAmount: 0,
        advancePaymentPercentage: 0,
        deadline: '',
        signedDate: '',
        paymentStatus: 'Pending',
        terms: '',
        notes: '',
      });
    }
  }, [contract, open]);

  const handleChange = (field: keyof ContractCreateRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Contract' : 'New Contract'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID *</Label>
              <Input
                id="customerId"
                value={formData.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
                placeholder="Enter customer ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
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
                onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advancePaymentPercentage">Advance Payment (%)</Label>
              <Input
                id="advancePaymentPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.advancePaymentPercentage}
                onChange={(e) => handleChange('advancePaymentPercentage', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signedDate">Signed Date</Label>
              <Input
                id="signedDate"
                type="date"
                value={formData.signedDate}
                onChange={(e) => handleChange('signedDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => handleChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="PartiallyPaid">Partially Paid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Contract description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => handleChange('terms', e.target.value)}
              placeholder="Contract terms..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Contract' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

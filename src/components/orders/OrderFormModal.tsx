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
import { AlertTriangle, Loader2 } from 'lucide-react';

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
  
  // Use primitive contractId (number) for selection
  const [contractId, setContractId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      // For edit mode, populate from existing order
      setContractId(order.contractId ? Number(order.contractId) : null);
      setDescription(order.description || '');
      setNotes(order.notes || '');
      // Create a contract summary from order data for display
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
      // Reset form for new order
      setContractId(null);
      setDescription('');
      setNotes('');
      setSelectedContract(null);
    }
    setErrors({});
  }, [order, open]);

  const handleContractChange = (selectedContractId: string, contract: ContractSummary | null) => {
    console.log('Contract selected:', selectedContractId, contract);
    
    // Store as number
    const numericId = selectedContractId ? Number(selectedContractId) : null;
    setContractId(numericId);
    setSelectedContract(contract);
    setErrors((prev) => ({ ...prev, contractId: '' }));
  };

  // Form is valid if contractId is selected
  // Description is optional per backend - but we can require it per UX
  const isFormValid = contractId !== null;

  // Show warning if contract is not approved, but DON'T block submission
  const showApprovalWarning = selectedContract && !selectedContract.isApproved;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractId) {
      setErrors({ contractId: 'Please select a contract' });
      return;
    }

    // Build payload with ONLY the fields backend expects
    const payload: CreateOrderDto = {
      contractId: contractId, // number
      description: description.trim(),
      notes: notes.trim(),
    };

    console.log('Submitting order payload:', payload);

    await onSubmit(payload);
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
                value={contractId ? String(contractId) : ''}
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

            {/* Warning for unapproved contracts - informational only */}
            {showApprovalWarning && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/30 text-warning-foreground dark:text-warning">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Contract not yet approved</p>
                  <p className="opacity-80">
                    This contract is in "{selectedContract?.status}" status. 
                    Order creation may be restricted by the system.
                  </p>
                </div>
              </div>
            )}

            {/* Contract Details Card */}
            {selectedContract && (
              <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                <h4 className="font-medium text-sm">Contract Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>{' '}
                    <span className="font-medium">{selectedContract.customerName}</span>
                  </div>
                  {selectedContract.customerPhone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      <span>{selectedContract.customerPhone}</span>
                    </div>
                  )}
                  {selectedContract.customerAddress && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address:</span>{' '}
                      <span>{selectedContract.customerAddress}</span>
                    </div>
                  )}
                  {selectedContract.categoryNames && selectedContract.categoryNames.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Categories:</span>{' '}
                      <span>{selectedContract.categoryNames.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    <span className="font-medium">
                      {new Intl.NumberFormat('uz-UZ').format(selectedContract.totalAmount)} UZS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update Order'
              ) : (
                'Create Order'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
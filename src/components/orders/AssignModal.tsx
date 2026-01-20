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
import { Order } from '@/types/order';
import { UserSelector } from './UserSelector';

type AssignType = 'constructor' | 'productionManager';

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string) => Promise<void>;
  order: Order | null;
  type: AssignType;
  loading: boolean;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  open,
  onClose,
  onSubmit,
  order,
  type,
  loading,
}) => {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const title = type === 'constructor' 
    ? 'Assign Constructor' 
    : 'Assign Production Manager';
  
  const label = type === 'constructor' 
    ? 'Constructor' 
    : 'Production Manager';

  const currentAssigned = type === 'constructor' 
    ? order?.constructorName 
    : order?.productionManagerName;

  useEffect(() => {
    if (!open) {
      setUserId('');
      setUserName('');
      setError('');
    }
  }, [open]);

  const handleUserChange = (newUserId: string, newUserName?: string) => {
    setUserId(newUserId);
    setUserName(newUserName || '');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError(`Please select a ${label.toLowerCase()}`);
      return;
    }

    await onSubmit(userId);
  };

  const handleClose = () => {
    setUserId('');
    setUserName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Order: <span className="font-medium text-foreground">{order?.orderNumber}</span>
              </p>
              {order?.customerName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Customer: <span className="font-medium text-foreground">{order.customerName}</span>
                </p>
              )}
            </div>

            {currentAssigned && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-sm">
                  Currently assigned: <span className="font-medium">{currentAssigned}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="user">{label} *</Label>
              <UserSelector
                value={userId}
                onChange={handleUserChange}
                disabled={loading}
                error={error}
                placeholder={`Select ${label.toLowerCase()}`}
                filterRole={type}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !userId}>
              {loading ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
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
import { Order } from '@/types/order';

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

  const title = type === 'constructor' 
    ? 'Assign Constructor' 
    : 'Assign Production Manager';
  
  const label = type === 'constructor' 
    ? 'Constructor ID' 
    : 'Production Manager ID';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      await onSubmit(userId.trim());
      setUserId('');
    }
  };

  const handleClose = () => {
    setUserId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Order: <span className="font-medium text-foreground">{order?.orderNumber}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">{label} *</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !userId.trim()}>
              {loading ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
import { Loader2 } from 'lucide-react';

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (department: { id: number; name: string }) => void;
  onSubmit: (data: { name: string }) => Promise<{ id: number; name: string }>;
}

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const newDepartment = await onSubmit({ name: name.trim() });
      onSuccess(newDepartment);
      setName('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setName('');
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="departmentName">Name *</Label>
            <Input
              id="departmentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              className={error && !name.trim() ? 'border-destructive' : ''}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

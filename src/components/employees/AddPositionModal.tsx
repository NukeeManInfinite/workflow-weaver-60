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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (position: { id: number; name: string }) => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<{ id: number; name: string }>;
}

export const AddPositionModal: React.FC<AddPositionModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Position name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const newPosition = await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      onSuccess(newPosition);
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setName('');
      setDescription('');
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="positionName">Name *</Label>
            <Input
              id="positionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter position name"
              className={error && !name.trim() ? 'border-destructive' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="positionDescription">Description (optional)</Label>
            <Textarea
              id="positionDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter position description"
              rows={3}
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
              Add Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

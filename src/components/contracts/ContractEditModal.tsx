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
import { Contract, PaymentStatus } from '@/types/contract';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface ContractEditModalProps {
  contract: Contract | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractEditModal: React.FC<ContractEditModalProps> = ({
  contract,
  open,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [terms, setTerms] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Initialize form when contract changes
  useEffect(() => {
    if (contract) {
      setTotalAmount(contract.totalAmount || 0);
      setAdvancePaymentPercentage(contract.advancePaymentPercentage || 0);
      setDescription(contract.description || '');
      setPaymentStatus(contract.paymentStatus || 'Pending');
      setTerms(contract.terms || contract.deliveryTerms || '');
      setNotes(contract.notes || '');
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    try {
      await contractService.update(contract.id, {
        totalAmount,
        advancePaymentPercentage,
        description,
        paymentStatus,
        terms,
        notes,
      });

      toast({
        title: 'Muvaffaqiyat',
        description: 'Shartnoma muvaffaqiyatli yangilandi',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.response?.data?.message || 'Shartnomani yangilashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Shartnomani tahrirlash</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contract Number - Read Only */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Shartnoma raqami</Label>
            <Input value={contract.contractNumber} disabled className="bg-muted" />
          </div>

          {/* Customer - Read Only */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Mijoz</Label>
            <Input value={contract.customerName} disabled className="bg-muted" />
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Umumiy summa (so'm)</Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Advance Payment Percentage */}
          <div className="space-y-2">
            <Label htmlFor="advancePaymentPercentage">Oldindan to'lov (%)</Label>
            <Input
              id="advancePaymentPercentage"
              type="number"
              value={advancePaymentPercentage}
              onChange={(e) => setAdvancePaymentPercentage(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">To'lov holati</Label>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Kutilmoqda</SelectItem>
                <SelectItem value="PartiallyPaid">Qisman to'langan</SelectItem>
                <SelectItem value="Paid">To'langan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label htmlFor="terms">Shartlar</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Izohlar</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

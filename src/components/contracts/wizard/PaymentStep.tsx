import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ContractWizardData } from '@/types/contract';
import { Calculator, CreditCard, Wallet } from 'lucide-react';

interface PaymentStepProps {
  data: ContractWizardData;
  onChange: (data: Partial<ContractWizardData>) => void;
}

export function PaymentStep({ data, onChange }: PaymentStepProps) {
  const remainingAmount = Math.max(0, data.totalAmount - data.advancePaymentAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' so\'m';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">To'lov ma'lumotlari</h3>
        <p className="text-sm text-muted-foreground">
          Shartnoma summasi va oldindan to'lov miqdorini kiriting
        </p>
      </div>

      <div className="grid gap-6">
        {/* Total Amount */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">
            Umumiy summa <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="totalAmount"
              type="number"
              placeholder="0"
              className="pl-10"
              value={data.totalAmount || ''}
              onChange={(e) => onChange({ totalAmount: Number(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Shartnomaning umumiy qiymati</p>
        </div>

        {/* Advance Payment */}
        <div className="space-y-2">
          <Label htmlFor="advancePayment">
            Oldindan to'lov <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="advancePayment"
              type="number"
              placeholder="0"
              className="pl-10"
              value={data.advancePaymentAmount || ''}
              onChange={(e) => onChange({ advancePaymentAmount: Number(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Mijoz tomonidan oldindan to'lanadigan summa</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-medium">To'lov xulosasi</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Umumiy summa</span>
            <span className="font-medium">{formatCurrency(data.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Oldindan to'lov</span>
            <span className="font-medium text-primary">
              - {formatCurrency(data.advancePaymentAmount)}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Qoldiq summa</span>
              <span className="font-bold text-lg">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {data.advancePaymentAmount > data.totalAmount && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          ⚠️ Oldindan to'lov umumiy summadan oshib ketmasligi kerak
        </div>
      )}
    </div>
  );
}

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractWizardData } from '@/types/contract';
import { Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TermsStepProps {
  data: ContractWizardData;
  onChange: (data: Partial<ContractWizardData>) => void;
}

const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'O\'zi olib ketadi' },
  { value: 'delivery_free', label: 'Bepul yetkazib berish' },
  { value: 'delivery_paid', label: 'Pullik yetkazib berish' },
  { value: 'custom', label: 'Boshqa shartlar' },
];

const PENALTY_OPTIONS = [
  { value: 'no_penalty', label: 'Jarima yo\'q' },
  { value: 'daily_0.1', label: 'Kunlik 0.1%' },
  { value: 'daily_0.5', label: 'Kunlik 0.5%' },
  { value: 'daily_1', label: 'Kunlik 1%' },
  { value: 'custom', label: 'Boshqa shartlar' },
];

export function TermsStep({ data, onChange }: TermsStepProps) {
  const finishDate = data.productionDurationDays
    ? addDays(new Date(), data.productionDurationDays)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Shartnoma shartlari</h3>
        <p className="text-sm text-muted-foreground">
          Ishlab chiqarish muddati va boshqa shartlarni belgilang
        </p>
      </div>

      <div className="grid gap-6">
        {/* Production Duration */}
        <div className="space-y-2">
          <Label htmlFor="productionDays">
            Ishlab chiqarish muddati (kun) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="productionDays"
              type="number"
              placeholder="30"
              className="pl-10"
              value={data.productionDurationDays || ''}
              onChange={(e) =>
                onChange({ productionDurationDays: Number(e.target.value) || 0 })
              }
            />
          </div>

          {/* Calculated Finish Date */}
          {finishDate && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tugash sanasi:</span>
              <span className="text-sm font-medium">
                {format(finishDate, 'dd.MM.yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Delivery Terms */}
        <div className="space-y-2">
          <Label htmlFor="deliveryTerms">
            Yetkazib berish shartlari <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.deliveryTerms}
            onValueChange={(value) => onChange({ deliveryTerms: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Shartni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Penalty Terms */}
        <div className="space-y-2">
          <Label htmlFor="penaltyTerms">
            Jarima shartlari <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.penaltyTerms}
            onValueChange={(value) => onChange({ penaltyTerms: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Shartni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {PENALTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Qo'shimcha izohlar</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Shartnoma bo'yicha qo'shimcha izohlar..."
            value={data.additionalNotes || ''}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <FileText className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Eslatma</p>
          <p className="text-muted-foreground">
            Barcha shartlar shartnoma hujjatida ko'rsatiladi. Iltimos, to'g'ri ma'lumotlarni kiriting.
          </p>
        </div>
      </div>
    </div>
  );
}

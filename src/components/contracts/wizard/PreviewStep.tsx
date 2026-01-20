import { useEffect, useState } from 'react';
import { ContractWizardData, Customer, Category } from '@/types/contract';
import { customerService } from '@/services/customerService';
import { categoryService } from '@/services/categoryService';
import {
  User,
  Package,
  CreditCard,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PreviewStepProps {
  data: ContractWizardData;
}

const DELIVERY_LABELS: Record<string, string> = {
  pickup: 'O\'zi olib ketadi',
  delivery_free: 'Bepul yetkazib berish',
  delivery_paid: 'Pullik yetkazib berish',
  custom: 'Boshqa shartlar',
};

const PENALTY_LABELS: Record<string, string> = {
  no_penalty: 'Jarima yo\'q',
  'daily_0.1': 'Kunlik 0.1%',
  'daily_0.5': 'Kunlik 0.5%',
  daily_1: 'Kunlik 1%',
  custom: 'Boshqa shartlar',
};

export function PreviewStep({ data }: PreviewStepProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [data]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load customer if existing
      if (!data.isNewCustomer && data.customerId) {
        const customerData = await customerService.getById(data.customerId);
        setCustomer(customerData);
      }

      // Load categories
      if (data.categoryIds.length > 0) {
        const allCategories = await categoryService.getAll();
        setCategories(allCategories.filter((c) => data.categoryIds.includes(c.id)));
      }
    } catch (error) {
      console.error('Failed to load preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' so\'m';
  };

  const remainingAmount = data.totalAmount - data.advancePaymentAmount;
  const finishDate = data.productionDurationDays
    ? addDays(new Date(), data.productionDurationDays)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Shartnoma xulosasi</h3>
        <p className="text-sm text-muted-foreground">
          Ma'lumotlarni tekshiring va tasdiqlang
        </p>
      </div>

      {/* Warning */}
      <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          Diqqat! Shartnoma yaratilgandan keyin ish boshqaruvchi tomonidan tasdiqlanishi kerak.
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg overflow-hidden">
        {/* Customer Info */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Mijoz ma'lumotlari</h4>
            {data.isNewCustomer && (
              <Badge variant="secondary" className="text-xs">Yangi</Badge>
            )}
          </div>
          <div className="grid gap-1 text-sm">
            <div className="flex">
              <span className="text-muted-foreground w-32">Ism:</span>
              <span className="font-medium">
                {data.isNewCustomer ? data.newCustomer?.fullName : customer?.fullName}
              </span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground w-32">Telefon:</span>
              <span>
                {data.isNewCustomer ? data.newCustomer?.phoneNumber : customer?.phoneNumber}
              </span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground w-32">Manzil:</span>
              <span>
                {data.isNewCustomer ? data.newCustomer?.address : customer?.address}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Mahsulotlar / Kategoriyalar</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="outline">
                {cat.name}
              </Badge>
            ))}
          </div>
          {data.description && (
            <p className="text-sm text-muted-foreground mt-2">{data.description}</p>
          )}
        </div>

        <Separator />

        {/* Payment */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h4 className="font-medium">To'lov ma'lumotlari</h4>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Umumiy summa:</span>
              <span className="font-medium">{formatCurrency(data.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oldindan to'lov:</span>
              <span className="font-medium text-primary">
                {formatCurrency(data.advancePaymentAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Qoldiq:</span>
              <span className="font-bold">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Terms */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Shartlar</h4>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Ishlab chiqarish:</span>
              <span className="font-medium">{data.productionDurationDays} kun</span>
              {finishDate && (
                <span className="text-muted-foreground">
                  (tugash: {format(finishDate, 'dd.MM.yyyy')})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Yetkazib berish:</span>
              <span>{DELIVERY_LABELS[data.deliveryTerms] || data.deliveryTerms}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Jarima:</span>
              <span>{PENALTY_LABELS[data.penaltyTerms] || data.penaltyTerms}</span>
            </div>
          </div>
          {data.additionalNotes && (
            <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
              <span className="text-muted-foreground">Qo'shimcha izoh:</span>
              <p className="mt-1">{data.additionalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

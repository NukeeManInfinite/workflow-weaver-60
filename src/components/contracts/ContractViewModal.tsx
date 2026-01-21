import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Contract } from '@/types/contract';
import { formatDate, isValidDate } from '@/lib/dateUtils';
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  CreditCard,
  Clock,
  Truck,
  AlertTriangle,
  StickyNote,
} from 'lucide-react';

interface ContractViewModalProps {
  contract: Contract | null;
  open: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-success/10 text-success border-success/30';
    case 'Completed':
      return 'bg-info/10 text-info border-info/30';
    case 'Draft':
      return 'bg-muted text-muted-foreground';
    case 'Cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-success/10 text-success border-success/30';
    case 'PartiallyPaid':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'Pending':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " so'm";
};

export const ContractViewModal: React.FC<ContractViewModalProps> = ({
  contract,
  open,
  onClose,
}) => {
  if (!contract) return null;

  const categoryDisplay = Array.isArray(contract.categoryNames)
    ? contract.categoryNames.join(', ')
    : contract.categoryNames || contract.categoryName || '-';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {contract.contractNumber}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className={getStatusColor(contract.status)}>
                {contract.status}
              </Badge>
              {contract.paymentStatus && (
                <Badge variant="outline" className={getPaymentStatusColor(contract.paymentStatus)}>
                  {contract.paymentStatus}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Mijoz ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ism</p>
                  <p className="font-medium">{contract.customerName}</p>
                </div>
              </div>
              {contract.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{contract.customerPhone}</p>
                  </div>
                </div>
              )}
              {contract.customerAddress && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Manzil</p>
                    <p className="font-medium">{contract.customerAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Product Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Mahsulot
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Kategoriya</p>
                <p className="font-medium">{categoryDisplay}</p>
              </div>
              {contract.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Tavsif</p>
                  <p className="font-medium">{contract.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              To'lov ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Umumiy summa</p>
                  <p className="font-medium text-lg">{formatCurrency(contract.totalAmount)}</p>
                </div>
              </div>
              {contract.advancePaymentAmount !== undefined && (
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Oldindan to'lov</p>
                    <p className="font-medium">{formatCurrency(contract.advancePaymentAmount)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Terms & Dates */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Shartlar va muddatlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.productionDurationDays !== undefined && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ishlab chiqarish muddati</p>
                    <p className="font-medium">{contract.productionDurationDays} kun</p>
                  </div>
                </div>
              )}
              {contract.deadline && isValidDate(contract.deadline) && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Muddat</p>
                    <p className="font-medium">{formatDate(contract.deadline)}</p>
                  </div>
                </div>
              )}
              {contract.deliveryTerms && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Yetkazib berish shartlari</p>
                    <p className="font-medium">{contract.deliveryTerms}</p>
                  </div>
                </div>
              )}
              {contract.penaltyTerms && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Jarima shartlari</p>
                    <p className="font-medium">{contract.penaltyTerms}</p>
                  </div>
                </div>
              )}
              {contract.notes && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Qo'shimcha izohlar</p>
                    <p className="font-medium">{contract.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Meta Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Tizim ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sotuvchi</p>
                <p className="font-medium">{contract.sellerName}</p>
              </div>
              {contract.createdAt && isValidDate(contract.createdAt) && (
                <div>
                  <p className="text-muted-foreground">Yaratilgan sana</p>
                  <p className="font-medium">{formatDate(contract.createdAt)}</p>
                </div>
              )}
              {contract.signedDate && isValidDate(contract.signedDate) && (
                <div>
                  <p className="text-muted-foreground">Imzolangan sana</p>
                  <p className="font-medium">{formatDate(contract.signedDate)}</p>
                </div>
              )}
              {contract.updatedAt && isValidDate(contract.updatedAt) && (
                <div>
                  <p className="text-muted-foreground">Oxirgi yangilanish</p>
                  <p className="font-medium">{formatDate(contract.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

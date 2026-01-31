import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContractWizardData, ContractCreateRequest } from '@/types/contract';
import { contractService } from '@/services/contractService';
import { CustomerStep } from './CustomerStep';
import { CategoryStep } from './CategoryStep';
import { PaymentStep } from './PaymentStep';
import { TermsStep } from './TermsStep';
import { PreviewStep } from './PreviewStep';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Package,
  CreditCard,
  FileText,
  Eye,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';

interface CreateContractWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: 'Mijoz', icon: User },
  { id: 2, title: 'Mahsulot', icon: Package },
  { id: 3, title: 'To\'lov', icon: CreditCard },
  { id: 4, title: 'Shartlar', icon: FileText },
  { id: 5, title: 'Tasdiqlash', icon: Eye },
  { id: 6, title: 'Yaratish', icon: Send },
];

const initialData: ContractWizardData = {
  isNewCustomer: true,
  customerId: undefined,
  newCustomer: { fullName: '', phoneNumber: '', address: '' },
  categoryIds: [],
  description: '',
  totalAmount: 0,
  advancePaymentAmount: 0,
  productionDurationDays: 0,
  deliveryTerms: '',
  penaltyTerms: '',
  additionalNotes: '',
};

export function CreateContractWizard({ open, onClose, onSuccess }: CreateContractWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ContractWizardData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (updates: Partial<ContractWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (data.isNewCustomer) {
          return !!(
            data.newCustomer?.fullName &&
            data.newCustomer?.phoneNumber &&
            data.newCustomer?.address
          );
        }
        return !!data.customerId;
      case 2:
        return data.categoryIds.length > 0;
      case 3:
        return data.totalAmount > 0 && data.advancePaymentAmount <= data.totalAmount;
      case 4:
        return !!(
          data.productionDurationDays > 0 &&
          data.deliveryTerms &&
          data.penaltyTerms
        );
      case 5:
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } else {
      toast({
        title: 'Xatolik',
        description: 'Iltimos, barcha majburiy maydonlarni to\'ldiring',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Calculate deadline from productionDurationDays
      const deadlineDate = data.productionDurationDays > 0
        ? addDays(new Date(), data.productionDurationDays)
        : null;

      const payload: ContractCreateRequest = {
        categoryIds: data.categoryIds,
        description: data.description,
        totalAmount: data.totalAmount,
        advancePaymentAmount: data.advancePaymentAmount,
        productionDurationDays: data.productionDurationDays,
        deliveryTerms: data.deliveryTerms,
        penaltyTerms: data.penaltyTerms,
        additionalNotes: data.additionalNotes,
        deadline: deadlineDate ? format(deadlineDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
      };

      if (data.isNewCustomer && data.newCustomer) {
        payload.newCustomer = data.newCustomer;
      } else {
        payload.customerId = data.customerId;
      }

      await contractService.create(payload);

      toast({
        title: 'Muvaffaqiyat',
        description: 'Shartnoma muvaffaqiyatli yaratildi',
      });

      // Reset and close
      setData(initialData);
      setCurrentStep(1);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.response?.data?.message || 'Shartnoma yaratishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setData(initialData);
    setCurrentStep(1);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CustomerStep data={data} onChange={handleChange} />;
      case 2:
        return <CategoryStep data={data} onChange={handleChange} />;
      case 3:
        return <PaymentStep data={data} onChange={handleChange} />;
      case 4:
        return <TermsStep data={data} onChange={handleChange} />;
      case 5:
        return <PreviewStep data={data} />;
      case 6:
        return (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Shartnoma yaratishga tayyor</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Barcha ma'lumotlar tekshirildi. "Shartnoma yaratish" tugmasini bosing.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Yangi shartnoma yaratish</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="py-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] px-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        isCompleted && 'bg-primary text-primary-foreground',
                        isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-1 font-medium',
                        isCurrent ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-12 h-0.5 mx-2',
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Orqaga
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={submitting}>
              Bekor qilish
            </Button>

            {currentStep < 6 ? (
              <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                Keyingi
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Shartnoma yaratish
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, ContractWizardData } from '@/types/contract';
import { customerService } from '@/services/customerService';
import { Loader2, User, UserPlus } from 'lucide-react';

interface CustomerStepProps {
  data: ContractWizardData;
  onChange: (data: Partial<ContractWizardData>) => void;
}

export function CustomerStep({ data, onChange }: CustomerStepProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data.isNewCustomer) {
      loadCustomers();
    }
  }, [data.isNewCustomer]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await customerService.getAll();
      setCustomers(result);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerTypeChange = (value: string) => {
    const isNew = value === 'new';
    onChange({
      isNewCustomer: isNew,
      customerId: undefined,
      newCustomer: isNew ? { fullName: '', phoneNumber: '', address: '' } : undefined,
    });
  };

  const handleNewCustomerChange = (field: keyof NonNullable<ContractWizardData['newCustomer']>, value: string) => {
    onChange({
      newCustomer: {
        ...data.newCustomer!,
        [field]: value,
      },
    });
  };

  const selectedCustomer = customers.find((c) => c.id === data.customerId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Mijoz tanlash</h3>
        <p className="text-sm text-muted-foreground">
          Yangi mijoz qo'shing yoki mavjud mijozlardan birini tanlang
        </p>
      </div>

      <RadioGroup
        value={data.isNewCustomer ? 'new' : 'existing'}
        onValueChange={handleCustomerTypeChange}
        className="grid grid-cols-2 gap-4"
      >
        <div className="relative">
          <RadioGroupItem value="new" id="new" className="peer sr-only" />
          <Label
            htmlFor="new"
            className="flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
          >
            <UserPlus className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Yangi mijoz</span>
            <span className="text-xs text-muted-foreground mt-1">Yangi mijoz qo'shish</span>
          </Label>
        </div>
        <div className="relative">
          <RadioGroupItem value="existing" id="existing" className="peer sr-only" />
          <Label
            htmlFor="existing"
            className="flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
          >
            <User className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Mavjud mijoz</span>
            <span className="text-xs text-muted-foreground mt-1">Ro'yxatdan tanlash</span>
          </Label>
        </div>
      </RadioGroup>

      {data.isNewCustomer ? (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium text-foreground">Yangi mijoz ma'lumotlari</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                To'liq ism <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Mijoz to'liq ismi"
                value={data.newCustomer?.fullName || ''}
                onChange={(e) => handleNewCustomerChange('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Telefon raqami <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phoneNumber"
                placeholder="+998 90 123 45 67"
                value={data.newCustomer?.phoneNumber || ''}
                onChange={(e) => handleNewCustomerChange('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                Manzil <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="Mijoz manzili"
                value={data.newCustomer?.address || ''}
                onChange={(e) => handleNewCustomerChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium text-foreground">Mavjud mijozni tanlang</h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Yuklanmoqda...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                value={data.customerId || ''}
                onValueChange={(value) => onChange({ customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mijozni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span>{customer.fullName}</span>
                        <span className="text-xs text-muted-foreground">{customer.phoneNumber}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCustomer && (
                <div className="p-3 bg-background rounded-md border">
                  <p className="font-medium">{selectedCustomer.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

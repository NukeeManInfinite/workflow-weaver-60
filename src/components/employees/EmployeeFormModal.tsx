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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Employee, Department } from '@/types';
import { departmentService } from '@/services/employeeService';
import { toast } from '@/hooks/use-toast';

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
}

export interface EmployeeFormData {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  positionId: number;
  departmentId: number;
  isActive: boolean;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
  onSubmit,
}) => {
  const isEditMode = !!employee;
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    positionId: 2, // Default: Employee
    departmentId: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  useEffect(() => {
    if (open) {
      fetchDepartments();
      if (employee) {
        setFormData({
          fullName: employee.fullName || '',
          phone: employee.phone || '',
          email: '',
          positionId: employee.positionId || 2,
          departmentId: employee.departmentId || 0,
          isActive: employee.isActive ?? true,
        });
      } else {
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          password: '',
          positionId: 2,
          departmentId: 0,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      // Set default departments if API fails
      setDepartments([
        { id: '1', name: 'Arrachi bo\'limi' },
        { id: '2', name: 'Yig\'ish bo\'limi' },
        { id: '3', name: 'Bo\'yoq bo\'limi' },
      ]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!isEditMode) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (!formData.departmentId || formData.departmentId === 0) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      toast({
        title: isEditMode ? 'Employee updated' : 'Employee created',
        description: `${formData.fullName} has been ${isEditMode ? 'updated' : 'added'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Operation failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Employee' : 'Add Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 XX XXX XX XX"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {!isEditMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.positionId.toString()}
              onValueChange={(value) => setFormData({ ...formData, positionId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Team Leader</SelectItem>
                <SelectItem value="2">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.departmentId ? formData.departmentId.toString() : ''}
              onValueChange={(value) => setFormData({ ...formData, departmentId: parseInt(value) })}
              disabled={loadingDepartments}
            >
              <SelectTrigger className={errors.departmentId ? 'border-destructive' : ''}>
                <SelectValue placeholder={loadingDepartments ? 'Loading...' : 'Select department'} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-sm text-destructive">{errors.departmentId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.isActive ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

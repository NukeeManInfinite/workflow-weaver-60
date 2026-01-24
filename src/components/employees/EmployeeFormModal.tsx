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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Employee } from '@/types';
import { toast } from '@/hooks/use-toast';

interface DepartmentOption {
  id: number;
  name: string;
}

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
  username: string;
  password?: string;
  role: string;
  positionId: number;
  departmentId: number;
  isActive: boolean;
  forcePasswordChange: boolean;
}

// Default departments - used when API is not available
const DEFAULT_DEPARTMENTS: DepartmentOption[] = [
  { id: 1, name: "Arrachi bo'limi" },
  { id: 2, name: "Yig'ish bo'limi" },
  { id: 3, name: "Bo'yoq bo'limi" },
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
  onSubmit,
}) => {
  const isEditMode = !!employee;
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>(DEFAULT_DEPARTMENTS);

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    phone: '',
    username: '',
    password: '',
    role: 'Employee',
    positionId: 2,
    departmentId: 0,
    isActive: true,
    forcePasswordChange: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          fullName: employee.fullName || '',
          phone: employee.phone || '',
          username: '',
          password: '',
          role: employee.positionId === 1 ? 'TeamLeader' : 'Employee',
          positionId: employee.positionId || 2,
          departmentId: employee.departmentId || 0,
          isActive: employee.isActive ?? true,
          forcePasswordChange: true,
        });
      } else {
        setFormData({
          fullName: '',
          phone: '',
          username: '',
          password: '',
          role: 'Employee',
          positionId: 2,
          departmentId: 0,
          isActive: true,
          forcePasswordChange: true,
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!isEditMode) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.role) {
        newErrors.role = 'Role is required';
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

  // Sync role with positionId
  const handlePositionChange = (value: string) => {
    const positionId = parseInt(value);
    const role = positionId === 1 ? 'TeamLeader' : 'Employee';
    setFormData({ ...formData, positionId, role });
  };

  // Sync positionId with role
  const handleRoleChange = (value: string) => {
    const positionId = value === 'TeamLeader' ? 1 : 2;
    setFormData({ ...formData, role: value, positionId });
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
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
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
            <Label htmlFor="position">Position *</Label>
            <Select
              value={formData.positionId.toString()}
              onValueChange={handlePositionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Team Leader</SelectItem>
                <SelectItem value="2">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="TeamLeader">Team Leader</SelectItem>
                  <SelectItem value="ProductionManager">Production Manager</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.departmentId ? formData.departmentId.toString() : ''}
              onValueChange={(value) => setFormData({ ...formData, departmentId: parseInt(value) })}
            >
              <SelectTrigger className={errors.departmentId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select department" />
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

          {isEditMode && (
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
          )}

          {!isEditMode && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="forcePasswordChange"
                checked={formData.forcePasswordChange}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, forcePasswordChange: checked === true })
                }
              />
              <Label htmlFor="forcePasswordChange" className="text-sm font-normal cursor-pointer">
                Force password change on first login
              </Label>
            </div>
          )}

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
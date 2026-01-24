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
import { CreatableSelect, SelectOption } from '@/components/ui/creatable-select';
import { AddPositionModal } from './AddPositionModal';
import { AddDepartmentModal } from './AddDepartmentModal';
import { positionService, departmentService } from '@/services/employeeService';

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

// Static roles from backend enum - CANNOT be created from frontend
const STATIC_ROLES = [
  { value: 'Salesperson', label: 'Salesperson' },
  { value: 'Constructor', label: 'Constructor' },
  { value: 'TeamLeader', label: 'Team Leader' },
  { value: 'Worker', label: 'Worker' },
  { value: 'WarehouseManager', label: 'Warehouse Manager' },
];

// Default positions - fallback if API fails
const DEFAULT_POSITIONS: SelectOption[] = [
  { id: 1, name: 'Team Leader' },
  { id: 2, name: 'Employee' },
];

// Default departments - fallback if API fails
const DEFAULT_DEPARTMENTS: SelectOption[] = [
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
  
  // Data lists
  const [positions, setPositions] = useState<SelectOption[]>(DEFAULT_POSITIONS);
  const [departments, setDepartments] = useState<SelectOption[]>(DEFAULT_DEPARTMENTS);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Add modals
  const [addPositionOpen, setAddPositionOpen] = useState(false);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    phone: '',
    username: '',
    password: '',
    role: 'Worker',
    positionId: 0,
    departmentId: 0,
    isActive: true,
    forcePasswordChange: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  // Fetch positions and departments when modal opens
  useEffect(() => {
    if (open) {
      fetchPositions();
      fetchDepartments();
      
      if (employee) {
        setFormData({
          fullName: employee.fullName || '',
          phone: employee.phone || '',
          username: '',
          password: '',
          role: employee.positionId === 1 ? 'TeamLeader' : 'Worker',
          positionId: employee.positionId || 0,
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
          role: 'Worker',
          positionId: 0,
          departmentId: 0,
          isActive: true,
          forcePasswordChange: true,
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const data = await positionService.getAll();
      if (data && data.length > 0) {
        setPositions(data.map(p => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      // Keep default positions
    } finally {
      setLoadingPositions(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await departmentService.getAll();
      if (data && data.length > 0) {
        setDepartments(data.map(d => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      // Keep default departments
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleAddPosition = async (data: { name: string; description?: string }) => {
    const newPosition = await positionService.create(data);
    return { id: newPosition.id, name: newPosition.name };
  };

  const handlePositionCreated = (position: { id: number; name: string }) => {
    setPositions(prev => [...prev, position]);
    setFormData(prev => ({ ...prev, positionId: position.id }));
    toast({
      title: 'Position created',
      description: `${position.name} has been added.`,
    });
  };

  const handleAddDepartment = async (data: { name: string }) => {
    const newDepartment = await departmentService.create(data);
    return { id: newDepartment.id, name: newDepartment.name };
  };

  const handleDepartmentCreated = (department: { id: number; name: string }) => {
    setDepartments(prev => [...prev, department]);
    setFormData(prev => ({ ...prev, departmentId: department.id }));
    toast({
      title: 'Department created',
      description: `${department.name} has been added.`,
    });
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

    if (!formData.positionId || formData.positionId === 0) {
      newErrors.positionId = 'Position is required';
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Employee' : 'Add Employee'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
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

            {/* Phone */}
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

            {/* Username & Password (only for create mode) */}
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

            {/* Position - CreatableSelect */}
            <div className="space-y-2">
              <Label>Position *</Label>
              <CreatableSelect
                value={formData.positionId ? formData.positionId.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, positionId: parseInt(value) })}
                options={positions}
                placeholder="Select position"
                onAddClick={() => setAddPositionOpen(true)}
                addButtonLabel="Add new position"
                loading={loadingPositions}
                error={!!errors.positionId}
              />
              {errors.positionId && (
                <p className="text-sm text-destructive">{errors.positionId}</p>
              )}
            </div>

            {/* Role - Static Select (NO create button) */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {STATIC_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>
            )}

            {/* Department - CreatableSelect */}
            <div className="space-y-2">
              <Label>Department *</Label>
              <CreatableSelect
                value={formData.departmentId ? formData.departmentId.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, departmentId: parseInt(value) })}
                options={departments}
                placeholder="Select department"
                onAddClick={() => setAddDepartmentOpen(true)}
                addButtonLabel="Add new department"
                loading={loadingDepartments}
                error={!!errors.departmentId}
              />
              {errors.departmentId && (
                <p className="text-sm text-destructive">{errors.departmentId}</p>
              )}
            </div>

            {/* Status (only for edit mode) */}
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
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Force Password Change (only for create mode) */}
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

      {/* Add Position Modal */}
      <AddPositionModal
        open={addPositionOpen}
        onOpenChange={setAddPositionOpen}
        onSuccess={handlePositionCreated}
        onSubmit={handleAddPosition}
      />

      {/* Add Department Modal */}
      <AddDepartmentModal
        open={addDepartmentOpen}
        onOpenChange={setAddDepartmentOpen}
        onSuccess={handleDepartmentCreated}
        onSubmit={handleAddDepartment}
      />
    </>
  );
};

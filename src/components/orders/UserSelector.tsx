import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User } from 'lucide-react';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';

interface UserSelectorProps {
  value: string;
  onChange: (userId: string, userName?: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  filterRole?: 'constructor' | 'productionManager' | 'all';
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Select a user',
  filterRole = 'all',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getAll();
        // Filter by role if needed
        let filtered = data;
        if (filterRole === 'constructor') {
          filtered = data.filter(
            (e) => e.role?.toLowerCase().includes('constructor') || e.role?.toLowerCase().includes('engineer')
          );
        } else if (filterRole === 'productionManager') {
          filtered = data.filter(
            (e) => e.role?.toLowerCase().includes('manager') || e.role?.toLowerCase().includes('production')
          );
        }
        setEmployees(filtered.length > 0 ? filtered : data);
      } catch (error) {
        console.error('Failed to load employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [filterRole]);

  const handleSelect = (userId: string) => {
    const employee = employees.find((e) => e.id === userId);
    onChange(userId, employee ? `${employee.firstName} ${employee.lastName}` : undefined);
  };

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {employees.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No users available
            </div>
          ) : (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </span>
                  {employee.role && (
                    <span className="text-muted-foreground text-xs">
                      ({employee.role})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};
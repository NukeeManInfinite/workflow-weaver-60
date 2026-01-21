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
import apiClient from '@/lib/api';

// API response type for constructors and production managers
interface UserOption {
  id: number;
  fullName: string;
  phone: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

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
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let endpoint = '/Users';
        
        // Use specific endpoints for constructors and production managers
        if (filterRole === 'constructor') {
          endpoint = '/Users/constructors';
        } else if (filterRole === 'productionManager') {
          endpoint = '/Users/production-managers';
        }
        
        const response = await apiClient.get<ApiResponse<UserOption[]>>(endpoint);
        
        // Extract data from the API response envelope
        if (response.data.success && response.data.data) {
          setUsers(response.data.data);
        } else {
          console.error('Failed to load users:', response.data.message);
          setUsers([]);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole]);

  const handleSelect = (userId: string) => {
    const user = users.find((u) => u.id.toString() === userId);
    onChange(userId, user?.fullName);
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
          {users.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No users available
            </div>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{user.fullName}</span>
                  {user.phone && (
                    <span className="text-muted-foreground text-xs">
                      ({user.phone})
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
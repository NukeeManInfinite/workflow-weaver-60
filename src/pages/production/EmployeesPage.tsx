import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Filter, Edit, MoreHorizontal, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockEmployees = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', role: 'TeamLeader', departmentName: 'Assembly', isActive: true },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', role: 'Employee', departmentName: 'Welding', isActive: true },
  { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike.j@company.com', role: 'Employee', departmentName: 'Assembly', isActive: true },
  { id: '4', firstName: 'Sarah', lastName: 'Williams', email: 'sarah.w@company.com', role: 'TeamLeader', departmentName: 'Painting', isActive: true },
  { id: '5', firstName: 'Tom', lastName: 'Brown', email: 'tom.b@company.com', role: 'Employee', departmentName: 'Welding', isActive: false },
  { id: '6', firstName: 'Lisa', lastName: 'Davis', email: 'lisa.d@company.com', role: 'Employee', departmentName: 'Assembly', isActive: true },
];

const getRoleBadge = (role: string) => {
  if (role === 'TeamLeader') {
    return <Badge variant="default">Team Leader</Badge>;
  }
  return <Badge variant="secondary">{role}</Badge>;
};

export const EmployeesPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Employees"
        description="Manage team members and roles"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">Total Employees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">42</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">5</div>
              <div className="text-sm text-muted-foreground">Team Leaders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">6</div>
              <div className="text-sm text-muted-foreground">Departments</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                    <TableCell>{getRoleBadge(employee.role)}</TableCell>
                    <TableCell>{employee.departmentName}</TableCell>
                    <TableCell>
                      <span className={employee.isActive ? 'status-badge status-completed' : 'status-badge status-error'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

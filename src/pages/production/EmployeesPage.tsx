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
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Employees"
        description="Manage team members and roles"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold">45</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <UserPlus className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-success">42</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Edit className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Team Leaders</p>
                  <p className="text-3xl font-bold text-info">5</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <MoreHorizontal className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-3xl font-bold text-warning">6</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <Filter className="h-6 w-6 text-warning" />
                </div>
              </div>
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
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Employees</CardTitle>
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

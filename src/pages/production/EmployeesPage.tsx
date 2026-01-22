import React, { useState, useEffect } from 'react';
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
import { Search, Filter, Edit, MoreHorizontal, UserPlus, Loader2, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';
import { EmployeeFormModal, EmployeeFormData, DeleteEmployeeModal } from '@/components/employees';
import { toast } from '@/hooks/use-toast';

const getRoleBadge = (positionId: number) => {
  // PositionId 1 = TeamLeader, 2 = Employee (based on DB structure)
  if (positionId === 1) {
    return <Badge variant="default">Team Leader</Badge>;
  }
  return <Badge variant="secondary">Employee</Badge>;
};

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormModalOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      setActionLoading(employee.id);
      await employeeService.toggleStatus(employee.id, !employee.isActive);
      toast({
        title: 'Status updated',
        description: `${employee.fullName} is now ${!employee.isActive ? 'active' : 'inactive'}`,
      });
      await fetchEmployees();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFormSubmit = async (formData: EmployeeFormData) => {
    if (selectedEmployee) {
      // Update existing employee
      await employeeService.update(selectedEmployee.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        positionId: formData.positionId,
        departmentId: formData.departmentId,
        isActive: formData.isActive,
      });
    } else {
      // Create new employee
      await employeeService.create({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password!,
        positionId: formData.positionId,
        departmentId: formData.departmentId,
        isActive: formData.isActive,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    try {
      await employeeService.delete(selectedEmployee.id);
      toast({
        title: 'Employee deleted',
        description: `${selectedEmployee.fullName} has been removed`,
      });
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete employee';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    teamLeaders: employees.filter(e => e.positionId === 1).length,
    departments: [...new Set(employees.map(e => e.departmentId))].length,
  };

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
                  <p className="text-3xl font-bold">{stats.total}</p>
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
                  <p className="text-3xl font-bold text-success">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Team Leaders</p>
                  <p className="text-3xl font-bold text-info">{stats.teamLeaders}</p>
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
                  <p className="text-3xl font-bold text-warning">{stats.departments}</p>
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
              <Input 
                placeholder="Search employees..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAddEmployee}>
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
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{employee.phone}</TableCell>
                      <TableCell>{getRoleBadge(employee.positionId)}</TableCell>
                      <TableCell>{employee.departmentName || `Dept ${employee.departmentId}`}</TableCell>
                      <TableCell>
                        <span className={employee.isActive ? 'status-badge status-completed' : 'status-badge status-error'}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled={actionLoading === employee.id}
                            >
                              {actionLoading === employee.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(employee)}>
                              {employee.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEmployee(employee)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        {searchTerm ? 'No employees match your search' : 'No employees found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
        onSubmit={handleFormSubmit}
      />

      <DeleteEmployeeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        employee={selectedEmployee}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

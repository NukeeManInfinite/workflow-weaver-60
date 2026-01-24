import apiClient from '@/lib/api';
import { Department, Employee, Task, KPIRecord, EmployeeKPISummary } from '@/types';

// Position types
export interface Position {
  id: number;
  name: string;
  description?: string;
}

export interface CreatePositionDto {
  name: string;
  description?: string;
}

// Position service
export const positionService = {
  async getAll(): Promise<Position[]> {
    const response = await apiClient.get<{ success: boolean; data: Position[] } | Position[]>('/Positions');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  async create(position: CreatePositionDto): Promise<Position> {
    const response = await apiClient.post<{ success: boolean; data: Position } | Position>('/Positions', position);
    if ('data' in response.data && 'success' in response.data) {
      return response.data.data;
    }
    return response.data as Position;
  },
};

// Department types
export interface DepartmentDto {
  id: number;
  name: string;
}

export interface CreateDepartmentDto {
  name: string;
}

// Department service
export const departmentService = {
  async getAll(): Promise<DepartmentDto[]> {
    const response = await apiClient.get<{ success: boolean; data: DepartmentDto[] } | DepartmentDto[]>('/Departments');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  async getById(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`/Departments/${id}`);
    return response.data;
  },

  async create(department: CreateDepartmentDto): Promise<DepartmentDto> {
    const response = await apiClient.post<{ success: boolean; data: DepartmentDto } | DepartmentDto>('/Departments', department);
    if ('data' in response.data && 'success' in response.data) {
      return response.data.data;
    }
    return response.data as DepartmentDto;
  },

  async update(id: string, department: Partial<Department>): Promise<Department> {
    const response = await apiClient.put<Department>(`/Departments/${id}`, department);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/Departments/${id}`);
  },
};

// DTO for creating employee with user account
export interface CreateEmployeeWithUserDto {
  fullName: string;
  phone: string;
  positionId: number;
  departmentId: number;
  username: string;
  password: string;
  role: string;
  forcePasswordChange: boolean;
}

export interface UpdateEmployeeDto {
  fullName: string;
  phone: string;
  positionId: number;
  departmentId: number;
  isActive: boolean;
}

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const response = await apiClient.get<{ success: boolean; data: Employee[] }>('/Employees');
    return response.data.data || response.data as unknown as Employee[];
  },

  async getByDepartment(departmentId: string): Promise<Employee[]> {
    const response = await apiClient.get<Employee[]>(`/departments/${departmentId}/employees`);
    return response.data;
  },

  async getById(id: number): Promise<Employee> {
    const response = await apiClient.get<{ success: boolean; data: Employee }>(`/Employees/${id}`);
    return response.data.data || response.data as unknown as Employee;
  },

  async createWithUser(employee: CreateEmployeeWithUserDto): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>('/Employees/with-user', employee);
    return response.data.data || response.data as unknown as Employee;
  },

  async update(id: number, employee: UpdateEmployeeDto): Promise<Employee> {
    const response = await apiClient.put<{ success: boolean; data: Employee }>(`/Employees/${id}`, employee);
    return response.data.data || response.data as unknown as Employee;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/Employees/${id}`);
  },

  async toggleStatus(id: number, isActive: boolean): Promise<Employee> {
    const response = await apiClient.patch<{ success: boolean; data: Employee }>(`/Employees/${id}/status`, { isActive });
    return response.data.data || response.data as unknown as Employee;
  },

  async getTeamLeaders(): Promise<Employee[]> {
    const response = await apiClient.get<{ success: boolean; data: Employee[] }>('/Employees/team-leaders');
    return response.data.data || response.data as unknown as Employee[];
  },

  async getByTeamLeader(teamLeaderId: string): Promise<Employee[]> {
    const response = await apiClient.get<Employee[]>(`/employees/team/${teamLeaderId}`);
    return response.data;
  },
};

export const taskService = {
  async getAll(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  async getByCategory(categoryId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/categories/${categoryId}/tasks`);
    return response.data;
  },

  async getByEmployee(employeeId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/employees/${employeeId}/tasks`);
    return response.data;
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/my');
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async create(task: Partial<Task>): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', task);
    return response.data;
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  async assignToEmployee(taskId: string, employeeId: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/assign`, { employeeId });
    return response.data;
  },

  async startTask(taskId: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/start`);
    return response.data;
  },

  async completeTask(taskId: string, actualTime?: number): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/complete`, { actualTime });
    return response.data;
  },

  async transferTask(taskId: string, toEmployeeId: string, reason: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/transfer`, { toEmployeeId, reason });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const kpiService = {
  async getByEmployee(employeeId: string): Promise<KPIRecord[]> {
    const response = await apiClient.get<KPIRecord[]>(`/employees/${employeeId}/kpi`);
    return response.data;
  },

  async getMyKPI(): Promise<KPIRecord[]> {
    const response = await apiClient.get<KPIRecord[]>('/kpi/my');
    return response.data;
  },

  async getAllSummaries(period?: string): Promise<EmployeeKPISummary[]> {
    const response = await apiClient.get<EmployeeKPISummary[]>('/kpi/summaries', {
      params: { period },
    });
    return response.data;
  },

  async getEmployeeSummary(employeeId: string, period?: string): Promise<EmployeeKPISummary> {
    const response = await apiClient.get<EmployeeKPISummary>(`/employees/${employeeId}/kpi/summary`, {
      params: { period },
    });
    return response.data;
  },
};

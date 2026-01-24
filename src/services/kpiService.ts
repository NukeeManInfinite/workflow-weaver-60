import { apiClient } from '@/lib/api';

// ===============================
// KPI Types based on backend APIs
// ===============================

// My KPI - Employee's own KPI
export interface MyKPI {
  employeeId: number;
  employeeName: string;
  completedTasks: number;
  totalTasks: number;
  efficiency: number; // percentage
  onTimeCompletion: number; // percentage
  performanceScore: number; // 0-100
  averageTaskTime: number; // in minutes
  period: string;
}

// Team KPI - For team leaders
export interface TeamKPI {
  teamId: number;
  teamName: string;
  teamLeaderId: number;
  teamLeaderName: string;
  totalMembers: number;
  teamProductivity: number; // percentage
  averageEfficiency: number; // percentage
  completedTasks: number;
  delayedTasks: number;
  onTimeTasks: number;
  performanceOverTime: PerformanceDataPoint[];
  memberPerformance: TeamMemberPerformance[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TeamMemberPerformance {
  employeeId: number;
  employeeName: string;
  completedTasks: number;
  efficiency: number;
  onTimeRate: number;
}

// Company KPI - For directors
export interface CompanyKPI {
  totalEmployees: number;
  activeEmployees: number;
  totalTeams: number;
  companyProductivity: number; // percentage
  totalTasksCompleted: number;
  totalTasksPending: number;
  averageEfficiency: number;
  departmentComparison: DepartmentKPI[];
  productivityTrends: PerformanceDataPoint[];
  taskStatusDistribution: TaskStatusData[];
}

export interface DepartmentKPI {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
  productivity: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface TaskStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// Task Performance KPI
export interface TaskPerformanceKPI {
  taskId: number;
  taskTitle: string;
  employeeId: number;
  employeeName: string;
  expectedTime: number; // in minutes
  actualTime: number; // in minutes
  efficiency: number; // percentage
  performanceRating: 'Excellent' | 'Good' | 'Average' | 'BelowAverage' | 'Poor';
  status: string;
  completedAt?: string;
}

// Team selection for team leaders
export interface Team {
  id: number;
  name: string;
  leaderId: number;
  leaderName: string;
  memberCount: number;
}

// ===============================
// Default/fallback values
// ===============================

const defaultMyKPI: MyKPI = {
  employeeId: 0,
  employeeName: '',
  completedTasks: 0,
  totalTasks: 0,
  efficiency: 0,
  onTimeCompletion: 0,
  performanceScore: 0,
  averageTaskTime: 0,
  period: 'This Month',
};

const defaultTeamKPI: TeamKPI = {
  teamId: 0,
  teamName: '',
  teamLeaderId: 0,
  teamLeaderName: '',
  totalMembers: 0,
  teamProductivity: 0,
  averageEfficiency: 0,
  completedTasks: 0,
  delayedTasks: 0,
  onTimeTasks: 0,
  performanceOverTime: [],
  memberPerformance: [],
};

const defaultCompanyKPI: CompanyKPI = {
  totalEmployees: 0,
  activeEmployees: 0,
  totalTeams: 0,
  companyProductivity: 0,
  totalTasksCompleted: 0,
  totalTasksPending: 0,
  averageEfficiency: 0,
  departmentComparison: [],
  productivityTrends: [],
  taskStatusDistribution: [],
};

// ===============================
// KPI Service
// ===============================

export const kpiService = {
  // GET /api/kpi/my-kpi - Current employee's KPI
  async getMyKPI(): Promise<MyKPI> {
    try {
      const response = await apiClient.get<{ success: boolean; data: MyKPI }>('/kpi/my-kpi');
      return response.data.data || defaultMyKPI;
    } catch (error) {
      console.error('Error fetching my KPI:', error);
      return defaultMyKPI;
    }
  },

  // GET /api/kpi/employee/{employeeId} - Specific employee's KPI
  async getEmployeeKPI(employeeId: number): Promise<MyKPI> {
    try {
      const response = await apiClient.get<{ success: boolean; data: MyKPI }>(`/kpi/employee/${employeeId}`);
      return response.data.data || defaultMyKPI;
    } catch (error) {
      console.error(`Error fetching KPI for employee ${employeeId}:`, error);
      return defaultMyKPI;
    }
  },

  // GET /api/kpi/team/{teamId} - Team KPI
  async getTeamKPI(teamId: number): Promise<TeamKPI> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TeamKPI }>(`/kpi/team/${teamId}`);
      return response.data.data || defaultTeamKPI;
    } catch (error) {
      console.error(`Error fetching KPI for team ${teamId}:`, error);
      return defaultTeamKPI;
    }
  },

  // GET /api/kpi/company - Company-wide KPI (Director only)
  async getCompanyKPI(): Promise<CompanyKPI> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CompanyKPI }>('/kpi/company');
      return response.data.data || defaultCompanyKPI;
    } catch (error) {
      console.error('Error fetching company KPI:', error);
      return defaultCompanyKPI;
    }
  },

  // GET /api/kpi/task/{detailTaskId}/performance - Task performance KPI
  async getTaskPerformance(taskId: number): Promise<TaskPerformanceKPI | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TaskPerformanceKPI }>(`/kpi/task/${taskId}/performance`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching task ${taskId} performance:`, error);
      return null;
    }
  },

  // GET /api/teams - Get available teams for team leader selection
  async getTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team[] }>('/teams');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  // GET /api/kpi/my-teams - Get teams led by current user
  async getMyTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team[] }>('/kpi/my-teams');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching my teams:', error);
      return [];
    }
  },
};

export default kpiService;

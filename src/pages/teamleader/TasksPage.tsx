import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserCheck, Clock, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockAssignedCategories = [
  { id: 'cat1', name: 'Steel Frames', orderNumber: 'ORD-2024-001', customerName: 'ABC Manufacturing', tasksCreated: 8, tasksCompleted: 5 },
  { id: 'cat2', name: 'Aluminum Panels', orderNumber: 'ORD-2024-001', customerName: 'ABC Manufacturing', tasksCreated: 6, tasksCompleted: 2 },
];

const mockTasks = [
  { id: 't1', title: 'Cut main frames', categoryName: 'Steel Frames', assignedTo: 'Mike Johnson', status: 'Done', priority: 'High', sequence: 1 },
  { id: 't2', title: 'Weld supports', categoryName: 'Steel Frames', assignedTo: 'Mike Johnson', status: 'InProgress', priority: 'High', sequence: 2 },
  { id: 't3', title: 'Sand edges', categoryName: 'Steel Frames', assignedTo: null, status: 'Created', priority: 'Medium', sequence: 3 },
  { id: 't4', title: 'Apply primer', categoryName: 'Steel Frames', assignedTo: null, status: 'Created', priority: 'Medium', sequence: 4 },
  { id: 't5', title: 'Cut panels', categoryName: 'Aluminum Panels', assignedTo: 'Lisa Davis', status: 'InProgress', priority: 'High', sequence: 1 },
  { id: 't6', title: 'Drill mounting holes', categoryName: 'Aluminum Panels', assignedTo: null, status: 'Created', priority: 'Medium', sequence: 2 },
];

const mockTeamMembers = [
  { id: 'e1', name: 'Mike Johnson', activeTasks: 2 },
  { id: 'e2', name: 'Lisa Davis', activeTasks: 1 },
  { id: 'e3', name: 'Tom Brown', activeTasks: 0 },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    Created: { className: 'status-badge status-pending', icon: Clock },
    Assigned: { className: 'status-badge status-active', icon: UserCheck },
    InProgress: { className: 'status-badge status-active', icon: Clock },
    Done: { className: 'status-badge status-completed', icon: CheckCircle },
    Transferred: { className: 'status-badge status-pending', icon: Clock },
  };
  const { className, icon: Icon } = config[status] || { className: 'status-badge', icon: Clock };
  return (
    <span className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </span>
  );
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, string> = {
    Low: 'bg-muted text-muted-foreground',
    Medium: 'bg-warning/10 text-warning',
    High: 'bg-destructive/10 text-destructive',
    Urgent: 'bg-destructive text-destructive-foreground',
  };
  return <Badge className={variants[priority]}>{priority}</Badge>;
};

export const TasksPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Task Management"
        description="Create and assign tasks to team members"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">28</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">12</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">8</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">8</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            {mockAssignedCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.orderNumber} • {category.customerName}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{category.tasksCompleted}/{category.tasksCreated} Tasks</p>
                        <div className="w-24 h-2 bg-muted rounded-full mt-1">
                          <div 
                            className="h-2 bg-success rounded-full"
                            style={{ width: `${(category.tasksCompleted / category.tasksCreated) * 100}%` }}
                          />
                        </div>
                      </div>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockTasks
                      .filter(t => t.categoryName === category.name)
                      .map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">#{task.sequence}</span>
                            <span className="font-medium">{task.title}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="flex items-center gap-4">
                            {task.assignedTo ? (
                              <span className="text-sm">{task.assignedTo}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Unassigned</span>
                            )}
                            {getStatusBadge(task.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Assign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all-tasks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Tasks</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search tasks..." className="pl-9 w-64" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{task.title}</span>
                        <Badge variant="outline">{task.categoryName}</Badge>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="flex items-center gap-4">
                        {task.assignedTo || <span className="text-sm text-muted-foreground">Unassigned</span>}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>View workload distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <Badge variant="secondary">{member.activeTasks} active tasks</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

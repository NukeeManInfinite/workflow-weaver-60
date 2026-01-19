import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockMyTasks = [
  { id: 't1', title: 'Cut main frames', categoryName: 'Steel Frames', orderNumber: 'ORD-2024-001', status: 'InProgress', priority: 'High', sequence: 1, estimatedTime: 60 },
  { id: 't2', title: 'Weld supports', categoryName: 'Steel Frames', orderNumber: 'ORD-2024-001', status: 'Assigned', priority: 'High', sequence: 2, estimatedTime: 90 },
  { id: 't3', title: 'Sand edges', categoryName: 'Steel Frames', orderNumber: 'ORD-2024-001', status: 'Assigned', priority: 'Medium', sequence: 3, estimatedTime: 45 },
];

export const MyTasksPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader title="My Tasks" description="Your assigned tasks" />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-info">3</div><div className="text-sm text-muted-foreground">Assigned</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-warning">1</div><div className="text-sm text-muted-foreground">In Progress</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-success">12</div><div className="text-sm text-muted-foreground">Completed Today</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Current Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mockMyTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.categoryName} • {task.orderNumber}</p>
                  </div>
                  <Badge className={task.priority === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}>{task.priority}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> Est. {task.estimatedTime} min</span>
                  {task.status === 'InProgress' ? (
                    <Button size="sm" className="bg-success hover:bg-success/90"><CheckCircle className="mr-2 h-4 w-4" />Mark Done</Button>
                  ) : (
                    <Button size="sm" variant="outline"><Play className="mr-2 h-4 w-4" />Start</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const MyKPIPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader title="My KPI" description="Your performance metrics" />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">45</div><div className="text-sm text-muted-foreground">Tasks Completed</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-success">94%</div><div className="text-sm text-muted-foreground">Productivity</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-info">42 min</div><div className="text-sm text-muted-foreground">Avg. Task Time</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-warning">4.8</div><div className="text-sm text-muted-foreground">Quality Score</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Performance Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="flex justify-between mb-2"><span>Productivity</span><span>94%</span></div><Progress value={94} className="h-2" /></div>
            <div><div className="flex justify-between mb-2"><span>Quality</span><span>96%</span></div><Progress value={96} className="h-2" /></div>
            <div><div className="flex justify-between mb-2"><span>On-Time Completion</span><span>88%</span></div><Progress value={88} className="h-2" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

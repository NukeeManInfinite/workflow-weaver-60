import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, Users, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockCategoriesToAssign = [
  { id: 'cat1', name: 'Steel Frames', orderNumber: 'ORD-2024-001', customerName: 'ABC Manufacturing', status: 'DimensionsSet', assignedTeamLeaderName: null },
  { id: 'cat2', name: 'Aluminum Panels', orderNumber: 'ORD-2024-001', customerName: 'ABC Manufacturing', status: 'DimensionsSet', assignedTeamLeaderName: 'John Doe' },
  { id: 'cat3', name: 'Custom Enclosures', orderNumber: 'ORD-2024-002', customerName: 'XYZ Industries', status: 'DimensionsSet', assignedTeamLeaderName: null },
];

const mockTeamLeaders = [
  { id: 'tl1', name: 'John Doe', department: 'Assembly', activeAssignments: 2 },
  { id: 'tl2', name: 'Sarah Williams', department: 'Painting', activeAssignments: 1 },
  { id: 'tl3', name: 'Mark Davis', department: 'Welding', activeAssignments: 3 },
];

export const AssignmentsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Category Assignments"
        description="Assign categories to team leaders"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">8</div>
              <div className="text-sm text-muted-foreground">Pending Assignments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">15</div>
              <div className="text-sm text-muted-foreground">Assigned Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">5</div>
              <div className="text-sm text-muted-foreground">Team Leaders</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search categories..." className="pl-9" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories to Assign */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Categories Ready for Assignment</h2>
            {mockCategoriesToAssign.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{category.name}</h3>
                        {category.assignedTeamLeaderName ? (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.orderNumber} • {category.customerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {category.assignedTeamLeaderName ? (
                        <div className="text-sm text-right">
                          <p className="text-muted-foreground">Assigned to</p>
                          <p className="font-medium">{category.assignedTeamLeaderName}</p>
                        </div>
                      ) : (
                        <Select>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Team Leader" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTeamLeaders.map((leader) => (
                              <SelectItem key={leader.id} value={leader.id}>
                                {leader.name} ({leader.activeAssignments})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {!category.assignedTeamLeaderName && (
                        <Button size="sm">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Leaders Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Team Leaders</h2>
            <Card>
              <CardContent className="p-0">
                {mockTeamLeaders.map((leader, index) => (
                  <div 
                    key={leader.id}
                    className={`flex items-center justify-between p-4 ${index !== mockTeamLeaders.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{leader.name}</p>
                        <p className="text-sm text-muted-foreground">{leader.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{leader.activeAssignments} active</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

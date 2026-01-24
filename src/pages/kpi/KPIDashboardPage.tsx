import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  kpiService, 
  MyKPI, 
  TeamKPI, 
  CompanyKPI, 
  Team 
} from '@/services/kpiService';
import { 
  EmployeeKPIView, 
  TeamKPIView, 
  DirectorKPIView 
} from '@/components/kpi';
import { UserRole } from '@/types/auth';

type KPIViewMode = 'employee' | 'teamleader' | 'director';

const getViewModeFromRole = (role: UserRole | undefined): KPIViewMode => {
  switch (role) {
    case 'Director':
    case 'ProductionManager':
      return 'director';
    case 'TeamLeader':
      return 'teamleader';
    case 'Employee':
    case 'Seller':
    case 'Constructor':
    case 'WarehouseManager':
    default:
      return 'employee';
  }
};

const getPageTitle = (viewMode: KPIViewMode): string => {
  switch (viewMode) {
    case 'director':
      return 'Company KPI Dashboard';
    case 'teamleader':
      return 'Team KPI Dashboard';
    case 'employee':
    default:
      return 'My Performance';
  }
};

const getPageDescription = (viewMode: KPIViewMode): string => {
  switch (viewMode) {
    case 'director':
      return 'Company-wide performance metrics and analytics';
    case 'teamleader':
      return 'Team performance metrics and member analytics';
    case 'employee':
    default:
      return 'Your personal performance metrics and achievements';
  }
};

export const KPIDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Determine view mode based on user role
  const viewMode = getViewModeFromRole(user?.role as UserRole);
  
  // State for different KPI data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Employee KPI state
  const [myKpi, setMyKpi] = useState<MyKPI | null>(null);
  
  // Team Leader KPI state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamKpi, setTeamKpi] = useState<TeamKPI | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  
  // Director KPI state
  const [companyKpi, setCompanyKpi] = useState<CompanyKPI | null>(null);

  // Fetch initial data based on role
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        switch (viewMode) {
          case 'employee':
            const employeeKpi = await kpiService.getMyKPI();
            setMyKpi(employeeKpi);
            break;
            
          case 'teamleader':
            const myTeams = await kpiService.getMyTeams();
            setTeams(myTeams);
            // Auto-select first team if available
            if (myTeams.length > 0) {
              setSelectedTeamId(myTeams[0].id);
            }
            break;
            
          case 'director':
            const companyData = await kpiService.getCompanyKPI();
            setCompanyKpi(companyData);
            break;
        }
      } catch (err) {
        console.error('Error fetching KPI data:', err);
        setError('Failed to load KPI data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [viewMode]);

  // Fetch team KPI when selected team changes (for team leaders)
  useEffect(() => {
    if (viewMode === 'teamleader' && selectedTeamId) {
      const fetchTeamKpi = async () => {
        try {
          setTeamLoading(true);
          const data = await kpiService.getTeamKPI(selectedTeamId);
          setTeamKpi(data);
        } catch (err) {
          console.error('Error fetching team KPI:', err);
        } finally {
          setTeamLoading(false);
        }
      };

      fetchTeamKpi();
    }
  }, [viewMode, selectedTeamId]);

  const handleTeamChange = (teamId: number) => {
    setSelectedTeamId(teamId);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      switch (viewMode) {
        case 'employee':
          const employeeKpi = await kpiService.getMyKPI();
          setMyKpi(employeeKpi);
          break;
          
        case 'teamleader':
          if (selectedTeamId) {
            const data = await kpiService.getTeamKPI(selectedTeamId);
            setTeamKpi(data);
          }
          break;
          
        case 'director':
          const companyData = await kpiService.getCompanyKPI();
          setCompanyKpi(companyData);
          break;
      }
    } catch (err) {
      console.error('Error refreshing KPI data:', err);
      setError('Failed to refresh KPI data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader 
          title={getPageTitle(viewMode)}
          description={getPageDescription(viewMode)}
        />
        <div className="p-6">
          <Card className="border border-destructive/50">
            <CardContent className="p-10 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading KPI Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title={getPageTitle(viewMode)}
        description={getPageDescription(viewMode)}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Role-Based KPI View */}
        {viewMode === 'employee' && (
          <EmployeeKPIView 
            kpi={myKpi} 
            loading={isLoading} 
          />
        )}

        {viewMode === 'teamleader' && (
          <TeamKPIView 
            teamKpi={teamKpi}
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamChange={handleTeamChange}
            loading={isLoading || teamLoading}
          />
        )}

        {viewMode === 'director' && (
          <DirectorKPIView 
            companyKpi={companyKpi} 
            loading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default KPIDashboardPage;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout";
import { LoginPage, UnauthorizedPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { KPIDashboardPage } from "@/pages/kpi";
import { ContractsPage, OrdersPage } from "@/pages/seller";
import { DimensionsPage, MaterialRequestsPage } from "@/pages/constructor";
import { EmployeesPage, AssignmentsPage } from "@/pages/production";
import { TasksPage } from "@/pages/teamleader";
import { MyTasksPage, MyKPIPage } from "@/pages/employee";
import { InventoryPage, StockManagementPage } from "@/pages/warehouse";
import { NotificationsPage } from "@/pages/notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contracts" element={<ProtectedRoute allowedRoles={['Seller', 'Director']}><ContractsPage /></ProtectedRoute>} />
              <Route path="/seller/contracts" element={<ProtectedRoute allowedRoles={['Seller', 'Director']}><ContractsPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute allowedRoles={['Seller', 'Director', 'Constructor', 'ProductionManager']}><OrdersPage /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['Seller', 'Director', 'Constructor', 'ProductionManager']}><OrdersPage /></ProtectedRoute>} />
              <Route path="/constructor" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorDashboard /></ProtectedRoute>} />
              <Route path="/constructor/orders" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorOrdersPage /></ProtectedRoute>} />
              <Route path="/constructor/orders/:id" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorOrdersPage /></ProtectedRoute>} />
              <Route path="/constructor/furniture-types" element={<ProtectedRoute allowedRoles={['Constructor']}><FurnitureTypesPage /></ProtectedRoute>} />
              <Route path="/constructor/furniture-types/:id" element={<ProtectedRoute allowedRoles={['Constructor']}><TechnicalSpecsPage /></ProtectedRoute>} />
              <Route path="/constructor/details" element={<ProtectedRoute allowedRoles={['Constructor']}><DetailsPage /></ProtectedRoute>} />
              <Route path="/constructor/drawings" element={<ProtectedRoute allowedRoles={['Constructor']}><DrawingsPage /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute allowedRoles={['ProductionManager', 'Director']}><EmployeesPage /></ProtectedRoute>} />
              <Route path="/assignments" element={<ProtectedRoute allowedRoles={['ProductionManager']}><AssignmentsPage /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute allowedRoles={['TeamLeader']}><TasksPage /></ProtectedRoute>} />
              <Route path="/team-tasks" element={<ProtectedRoute allowedRoles={['TeamLeader']}><TasksPage /></ProtectedRoute>} />
              <Route path="/my-tasks" element={<ProtectedRoute allowedRoles={['Employee']}><MyTasksPage /></ProtectedRoute>} />
              <Route path="/my-kpi" element={<ProtectedRoute allowedRoles={['Employee']}><MyKPIPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={['WarehouseManager']}><InventoryPage /></ProtectedRoute>} />
              <Route path="/stock-management" element={<ProtectedRoute allowedRoles={['WarehouseManager']}><StockManagementPage /></ProtectedRoute>} />
              <Route path="/kpi-dashboard" element={<ProtectedRoute allowedRoles={['Director', 'ProductionManager']}><KPIDashboardPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

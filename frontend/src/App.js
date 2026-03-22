import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';

// Pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import AcceptInvitePage   from './pages/auth/AcceptInvitePage';
import ForcePasswordPage  from './pages/auth/ForcePasswordPage';
import AppLayout          from './components/layout/AppLayout';
import DashboardPage      from './pages/app/DashboardPage';
import ProjectsPage       from './pages/app/ProjectsPage';
import TasksPage          from './pages/app/TasksPage';
import KanbanPage         from './pages/app/KanbanPage';
import TeamPage           from './pages/app/TeamPage';
import AIAssistantPage    from './pages/app/AIAssistantPage';
import AnalyticsPage      from './pages/app/AnalyticsPage';
import SettingsPage       from './pages/app/SettingsPage';
import SuperAdminPage     from './pages/admin/SuperAdminPage';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 120000 } } });

const Guard = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.isFirstLogin) return <Navigate to="/force-password" replace />;
  return children;
};

const Public = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && !user?.isFirstLogin) return <Navigate to="/app/dashboard" replace />;
  return children;
};

export default function App() {
  const { isAuthenticated, refreshUser } = useAuthStore();
  useEffect(() => { if (isAuthenticated) refreshUser(); }, []);

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/"                    element={<LandingPage />} />
          <Route path="/login"               element={<Public><LoginPage /></Public>} />
          <Route path="/register"            element={<Public><RegisterPage /></Public>} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          <Route path="/force-password"      element={<ForcePasswordPage />} />

          <Route path="/app" element={<Guard><AppLayout /></Guard>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="projects"     element={<ProjectsPage />} />
            <Route path="tasks"        element={<TasksPage />} />
            <Route path="kanban"       element={<KanbanPage />} />
            <Route path="team"         element={<TeamPage />} />
            <Route path="ai"           element={<AIAssistantPage />} />
            <Route path="analytics"    element={<AnalyticsPage />} />
            <Route path="settings"     element={<SettingsPage />} />
          </Route>

          {/* Super Admin — full page, no app layout */}
          <Route path="/superadmin" element={
            <Guard><SuperAdminPage /></Guard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #E5E3F0',
          },
        }}
      />
    </QueryClientProvider>
  );
}

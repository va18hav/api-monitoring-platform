import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { AppLayout } from './shared/components/AppLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { ProjectDetailPage } from './features/projects/pages/ProjectDetailPage';
import { MonitorDetailPage } from './features/monitor/pages/MonitorDetailPage';
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage';

export default function App() {
    return (
        <BrowserRouter>
            {/* Global Toasts */}
            <Toaster position="top-right" richColors />

            <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Secured Private Dashboard Layout */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/projects/:id" element={<ProjectDetailPage />} />
                        <Route path="/monitors/:id" element={<MonitorDetailPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

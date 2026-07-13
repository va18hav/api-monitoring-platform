import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useVerifySession } from '../../features/auth/hooks/useAuth';
import { Activity } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Trigger session validation query (syncs with the store inside the hook)
    useVerifySession();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
                <Activity size={48} className="text-blue-600 animate-bounce" />
                <div className="text-slate-500 font-mono text-sm font-semibold tracking-widest animate-pulse">
                    VERIFYING PINGLOOP SECURE ROUTE...
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};


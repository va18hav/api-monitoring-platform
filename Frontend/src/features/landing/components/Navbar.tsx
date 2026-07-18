import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuthStore();
    
    // Read session hint for synchronous initial render safety
    const hasHint = localStorage.getItem('pingdeck_session_active') === 'true';
    const showDashboardButton = isAuthenticated || (isLoading && hasHint);

    return (
        <nav className="fixed top-0 inset-x-0 h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/60 z-50 flex items-center justify-between px-6 sm:px-12 select-none shadow-xs">
            <div 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2.5 text-blue-600 font-extrabold text-xl font-mono cursor-pointer hover:opacity-90 transition-opacity"
            >
                <Activity size={24} className="stroke-[2.5]" />
                <span>PingDeck</span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {isLoading && !hasHint ? (
                    <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                ) : showDashboardButton ? (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg cursor-pointer"
                    >
                        Go to Dashboard
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg cursor-pointer"
                        >
                            Get Started
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

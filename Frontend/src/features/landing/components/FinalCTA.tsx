import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const FinalCTA: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="py-20 border-t border-slate-200/60 bg-white text-center select-none">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Build reliable APIs. Keep them online.
                </h2>
                <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
                    Get started with PingDeck today to monitor endpoints, inspect responses, and receive downtime alerts.
                </p>
                <div className="pt-2 flex justify-center">
                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-150 flex items-center space-x-2 cursor-pointer group"
                    >
                        <span>{isAuthenticated ? 'Go to Dashboard' : 'Start your project'}</span>
                        <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

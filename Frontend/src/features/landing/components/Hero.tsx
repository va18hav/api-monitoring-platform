import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { FeatureCards } from './FeatureCards';
import { ApiNetworkCluster } from './ApiNetworkCluster';

export const Hero: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const handlePrimary = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <section className="pt-28 pb-12 px-6 lg:px-12 bg-white select-none">
            <div className="max-w-6xl mx-auto">
                {/* Supabase style 2-Column Hero layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-8">
                    {/* Left Column: Headline, Subtitle & Action Buttons */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
                            <ShieldCheck size={14} className="text-blue-600" />
                            <span>Uptime Monitoring & API Testing</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-900 tracking-tight leading-[1.15] font-sans">
                            Monitor your APIs.<br />
                            <span className="text-blue-600">Catch outages instantly.</span>
                        </h1>

                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                            Automated health checks, real-time response latency analytics, and instant downtime alerts to ensure your web services stay fast and reliable.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                            <button
                                onClick={handlePrimary}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer group"
                            >
                                <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Monitoring Free'}</span>
                                <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            {!isAuthenticated && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Interactive Animated API Network Cluster */}
                    <div className="lg:col-span-6">
                        <ApiNetworkCluster />
                    </div>
                </div>

                {/* 3 Mini UI Feature Cards directly beneath the Hero */}
                <FeatureCards />
            </div>
        </section>
    );
};

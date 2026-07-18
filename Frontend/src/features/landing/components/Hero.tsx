import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const Hero: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const handleCtas = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <section className="relative pt-32 pb-20 px-6 sm:px-12 flex flex-col items-center text-center overflow-hidden bg-gradient-to-b from-blue-50/20 via-white to-white select-none">
            {/* Background Grid Pattern decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-4xl space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-150 rounded-full text-[10px] font-bold text-blue-700 font-mono tracking-wide uppercase">
                    <ShieldCheck size={12} className="stroke-[2.5]" />
                    <span>PingDeck Production-Ready API client</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-sans">
                    Reliable Uptime Monitoring & <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Collaborative API Testing</span>
                </h1>

                <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-base leading-relaxed font-semibold">
                    Create team request folders, build and execute HTTP checks, analyze real-time latency trends, and dispatch immediate alerts on system downtime. Designed to keep API monitoring simple and efficient.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                    <button
                        onClick={handleCtas}
                        className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-150 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                    >
                        <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    {!isAuthenticated && (
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 py-3.5 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
                        >
                            Sign In to Your Deck
                        </button>
                    )}
                </div>
            </div>

            {/* Mockup visual display */}
            <div className="relative z-10 w-full max-w-5xl mt-16 px-2 sm:px-4 animate-fade-in">
                {/* Glowing shadow effect */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-10 blur-xl pointer-events-none" />
                
                <div className="bg-white border border-slate-200 p-2.5 rounded-2xl shadow-2xl relative">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden aspect-[16/10]">
                        <img 
                            src="/workspace_mockup.png" 
                            alt="PingDeck Workspace API Request Panel Client" 
                            className="w-full h-full object-cover rounded-lg border border-slate-150/40 select-none pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

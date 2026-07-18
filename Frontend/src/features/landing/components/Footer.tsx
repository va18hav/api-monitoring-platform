import React from 'react';
import { Activity } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200/60 py-12 px-6 sm:px-12 select-none">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-2.5 text-slate-500 font-extrabold text-base font-mono">
                    <Activity size={18} className="stroke-[2.5] text-slate-400" />
                    <span>PingDeck</span>
                </div>
                
                <p className="text-slate-400 text-xs font-semibold text-center md:text-left">
                    Collaborative API monitoring, uptime checks, and telemetry analytics platform.
                </p>

                <p className="text-slate-400 text-xs font-mono">
                    &copy; 2026 PingDeck. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

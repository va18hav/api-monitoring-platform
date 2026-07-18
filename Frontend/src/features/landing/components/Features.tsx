import React from 'react';
import { Terminal, Clock, FolderClosed, Bell, Activity, Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
    const list = [
        {
            title: 'Interactive API Request Client',
            description: 'Run HTTP requests (GET, POST, PUT, DELETE) dynamically. Set headers, query parameters, auth configurations, and track body output.',
            icon: Terminal,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Automated Uptime Monitors',
            description: 'Define recurrence intervals to evaluate endpoints constantly. Keep systems online and trace checks automatically in background queues.',
            icon: Clock,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            title: 'Directory Tree Workspace',
            description: 'Arrange requests in nested folders. Focus detail panels, scope requests, and toggle expand files easily on clean navigation panels.',
            icon: FolderClosed,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Failsafe Email Dispatches',
            description: 'Trigger instant notifications using Resend integration when checks fail or experience timeouts, minimizing recovery response delays.',
            icon: Bell,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        }
    ];

    return (
        <section className="py-20 bg-white border-t border-slate-100 px-6 sm:px-12 select-none">
            <div className="max-w-6xl mx-auto space-y-20">
                
                {/* Heading Title */}
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700 font-mono tracking-wide uppercase">
                        <Sparkles size={11} className="stroke-[2.5]" />
                        <span>Robust API Management Toolkit</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                        Everything You Need to Monitor and Test APIs
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-xl mx-auto">
                        PingDeck combines a full-featured HTTP workspace developer interface with active background validators to ensure your services remain online.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {list.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={i} 
                                className="bg-slate-50/50 border border-slate-200/60 p-6 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-200"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                    <Icon size={20} className="stroke-[2]" />
                                </div>
                                <div className="mt-6 space-y-2">
                                    <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{item.title}</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Split Mockup Telemetry panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 border-t border-slate-100">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-700 font-mono tracking-wide uppercase">
                            <Activity size={11} className="stroke-[2.5]" />
                            <span>Real-Time Latency Trends</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-sans">
                            Deep Telemetry Into Response Times & Latencies
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                            Get immediate logs of check success states, response latencies (in milliseconds), HTTP response body payloads, and response headers. Trace problems instantly with our detailed historical check logs.
                        </p>
                        
                        <div className="space-y-3 font-semibold text-xs text-slate-600">
                            <div className="flex items-center space-x-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>Smooth line charts visualizing the latest 20 check latencies</span>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>Complete log inspector modals for body and headers</span>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>Fail filters to query specific outage events easily</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 relative px-2">
                        {/* Glowing shadow effect */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-10 blur-xl pointer-events-none" />
                        <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xl relative">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden aspect-[16/10]">
                                <img 
                                    src="/analytics_mockup.png" 
                                    alt="PingDeck API Monitoring Latency Charts Dashboard" 
                                    className="w-full h-full object-cover rounded-lg border border-slate-150/40 select-none pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

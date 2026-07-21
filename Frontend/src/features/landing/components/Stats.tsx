import React from 'react';

const METRICS = [
    { label: 'Uptime Reliability', value: '99.99%', sub: 'Continuous endpoint checks' },
    { label: 'Avg Latency', value: '< 100ms', sub: 'Fast performance tracking' },
    { label: 'Automated Checks', value: '24/7', sub: 'Scheduled health polling' },
    { label: 'Alert Dispatch', value: 'Instant', sub: 'Immediate outage alerts' },
];

export const Stats: React.FC = () => {
    return (
        <section className="py-16 border-t border-slate-200/60 bg-slate-50/50 select-none">
            <div className="max-w-6xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {METRICS.map((item) => (
                        <div key={item.label} className="space-y-1">
                            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                                {item.label}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {item.value}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

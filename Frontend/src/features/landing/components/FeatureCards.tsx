import React from 'react';
import { Activity, BarChart2, Bell } from 'lucide-react';

// ─── Mini UI: endpoint status rows ──────────────────────────────────────────
const MonitorMini: React.FC = () => (
    <div className="mt-5 rounded-lg border border-slate-200 overflow-hidden text-xs">
        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-400 font-semibold">
            active endpoints
        </div>
        {[
            { name: '/api/health', ms: '42ms', up: true },
            { name: '/api/users',  ms: '89ms', up: true },
            { name: '/api/auth',   ms: 'DOWN',  up: false },
        ].map(row => (
            <div key={row.name} className="flex items-center justify-between px-3 py-2 border-b border-slate-100 last:border-0 bg-white">
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${row.up ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-mono text-[11px] text-slate-600">{row.name}</span>
                </div>
                <span className={`font-mono text-[11px] font-semibold ${row.up ? 'text-slate-500' : 'text-rose-600'}`}>{row.ms}</span>
            </div>
        ))}
    </div>
);

// ─── Mini UI: SVG sparkline ──────────────────────────────────────────────────
const LatencyMini: React.FC = () => (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3 overflow-hidden">
        <div className="font-mono text-[10px] text-slate-400 mb-2">last 20 checks · ms</div>
        <svg width="100%" viewBox="0 0 200 54" preserveAspectRatio="none" className="overflow-visible">
            <polyline
                points="0,49 11,47 21,49 32,50 42,45 53,49 63,50 74,36 84,49 95,48 105,50 116,49 126,2 137,47 147,50 158,49 168,48 179,50 190,49 200,49"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="126" cy="2" r="2.5" fill="#f43f5e" />
        </svg>
        <div className="flex gap-4 mt-1.5 font-mono text-[10px] text-slate-400">
            <span>avg <span className="text-slate-700 font-semibold">52ms</span></span>
            <span>p95 <span className="text-slate-700 font-semibold">89ms</span></span>
            <span className="text-rose-500">1 spike</span>
        </div>
    </div>
);

// ─── Mini UI: alert email card ───────────────────────────────────────────────
const AlertMini: React.FC = () => (
    <div className="mt-5 rounded-lg border border-slate-200 overflow-hidden text-xs">
        <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="font-mono text-[10px] text-rose-700 font-semibold">PingDeck Alert · Outage Detected</span>
        </div>
        <div className="p-3 space-y-1.5 bg-white font-mono text-[10px] text-slate-500">
            <div><span className="text-slate-400 mr-1">endpoint</span> api.acme.com/health</div>
            <div><span className="text-slate-400 mr-1">status  </span> <span className="text-rose-600 font-semibold">504 Gateway Timeout</span></div>
            <div><span className="text-slate-400 mr-1">latency </span> 10,023ms</div>
            <div><span className="text-slate-400 mr-1">at      </span> Jul 21 · 03:47 AM</div>
        </div>
    </div>
);

// ─── Cards ───────────────────────────────────────────────────────────────────
const CARDS = [
    {
        Icon: Activity,
        title: 'Uptime Monitoring',
        desc: 'Schedule automated health checks for your endpoints with flexible check intervals. Keep critical web services monitored continuously.',
        mini: <MonitorMini />,
    },
    {
        Icon: BarChart2,
        title: 'Latency Analytics',
        desc: 'Track response time metrics and trends. Spot performance degradation early with check latency history and log details.',
        mini: <LatencyMini />,
    },
    {
        Icon: Bell,
        title: 'Instant Alerts',
        desc: 'Get immediate email dispatches the moment an endpoint experiences downtime, timeouts, or unexpected HTTP error codes.',
        mini: <AlertMini />,
    },
];

export const FeatureCards: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pb-16">
        {CARDS.map(({ Icon, title, desc, mini }) => (
            <div
                key={title}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{title}</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                {mini}
            </div>
        ))}
    </div>
);

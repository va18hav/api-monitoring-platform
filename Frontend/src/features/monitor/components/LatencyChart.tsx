import React from 'react';
import type { MonitorResponse } from '../types/monitor.types';

interface LatencyChartProps {
    responses?: MonitorResponse[];
}

export const LatencyChart: React.FC<LatencyChartProps> = ({ responses }) => {
    const validLatencies = responses?.filter((r) => r.responseTime !== null).map((r) => r.responseTime!) ?? [];
    const chartData = [...(responses ?? [])].slice(0, 20).reverse();
    const maxLatency = validLatencies.length > 0 ? Math.max(...validLatencies) : 200;

    // SVG Line chart layout parameters
    const chartWidth = 800;
    const chartHeight = 160; 
    const paddingX = 0; 
    const paddingY = 8; 

    const points = chartData.map((data, idx) => {
        const x = paddingX + (idx / Math.max(chartData.length - 1, 1)) * (chartWidth - paddingX * 2);
        const latencyVal = data.responseTime ?? 0;
        const y = chartHeight - paddingY - (maxLatency > 0 ? (latencyVal / maxLatency) : 0) * (chartHeight - paddingY * 2);
        return { x, y, data };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
        : '';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Latency History (ms)</h3>
                <p className="text-slate-400 text-xs">Response time trends for the latest 20 checks (newer to the right)</p>
            </div>

            <div className="w-full h-52 flex items-center justify-center bg-slate-50/20 relative overflow-hidden border-t border-slate-100">
                {chartData.length > 0 ? (
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="latency-area-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>
                        
                        {/* Grid Guidelines */}
                        <line x1={0} y1={paddingY} x2={chartWidth} y2={paddingY} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1={0} y1={(chartHeight - paddingY * 2) / 2 + paddingY} x2={chartWidth} y2={(chartHeight - paddingY * 2) / 2 + paddingY} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1.5" />

                        {/* Area gradient under line */}
                        {areaPath && (
                            <path d={areaPath} fill="url(#latency-area-gradient)" />
                        )}

                        {/* Connecting Line */}
                        {linePath && (
                            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        )}

                        {/* Circles representing points */}
                        {points.map((p) => (
                            <g key={p.data.id} className="group cursor-pointer">
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="6"
                                    className={`transition-all duration-150 group-hover:r-8 stroke-white stroke-2 ${
                                        p.data.status === 'UP' ? 'fill-emerald-500' : 'fill-rose-500'
                                    }`}
                                />
                                {/* Built-in tooltip */}
                                <title>
                                    {`Latency: ${p.data.responseTime ?? 'N/A'}ms\nStatus: ${p.data.status}\nTime: ${new Date(p.data.createdAt).toLocaleTimeString()}`}
                                </title>
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div className="text-slate-400 font-mono text-xs">
                        Waiting for check responses to build latency chart...
                    </div>
                )}
            </div>
        </div>
    );
};

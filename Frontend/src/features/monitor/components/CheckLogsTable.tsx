import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { MonitorResponse } from '../types/monitor.types';

interface CheckLogsTableProps {
    responses?: MonitorResponse[];
}

export const CheckLogsTable: React.FC<CheckLogsTableProps> = ({ responses }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Historical Check Logs</h2>
                <p className="text-slate-500 text-xs">Chronological trace logs of all health status checks</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono bg-slate-50/20">
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Response Time</th>
                            <th className="py-4 px-6">Status Code</th>
                            <th className="py-4 px-6">Log Message / Error</th>
                            <th className="py-4 px-6">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {responses && responses.length > 0 ? (
                            responses.map((res) => (
                                <tr key={res.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="flex items-center space-x-2">
                                            {res.status === 'UP' ? (
                                                <ShieldCheck size={16} className="text-emerald-500" />
                                            ) : (
                                                <ShieldAlert size={16} className="text-rose-500" />
                                            )}
                                            <span className={`text-xs font-semibold ${
                                                res.status === 'UP' ? 'text-emerald-700' : 'text-rose-700'
                                            }`}>
                                                {res.status}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-slate-700 text-xs">
                                        {res.responseTime ? `${res.responseTime}ms` : 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 font-mono text-slate-600 text-xs">
                                        {res.statusCode || 'Timeout/Error'}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 font-mono text-xs max-w-sm truncate" title={res.error || 'Check completed successfully'}>
                                        {res.error || 'Check completed successfully'}
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 text-xs">
                                        {new Date(res.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                                    No response history logged yet for this monitor check.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Globe } from 'lucide-react';
import { useDeleteEndpoint } from '../hooks/useProjects';
import type { Endpoint } from '../types/project.types';

interface EndpointsTableProps {
    endpoints?: Endpoint[];
    projectId: string;
    isLoading: boolean;
}

export const EndpointsTable: React.FC<EndpointsTableProps> = ({ endpoints, projectId, isLoading }) => {
    const navigate = useNavigate();
    const deleteEndpointMutation = useDeleteEndpoint(projectId);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to cancel this monitor check?')) {
            deleteEndpointMutation.mutate(id);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Project Endpoints</h2>
                <p className="text-slate-500 text-xs">Monitored ping endpoints in this project workspace</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono bg-slate-50/20">
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Endpoint Name</th>
                            <th className="py-4 px-6">Target URL</th>
                            <th className="py-4 px-6">Method</th>
                            <th className="py-4 px-6">Interval Frequency</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    Loading endpoints list...
                                </td>
                            </tr>
                        ) : endpoints && endpoints.length > 0 ? (
                            endpoints.map((endpoint) => (
                                <tr key={endpoint.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="flex items-center space-x-2">
                                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                                                endpoint.status === 'UP'
                                                    ? 'bg-emerald-500 shadow-sm shadow-emerald-200'
                                                    : endpoint.status === 'DOWN'
                                                    ? 'bg-rose-500 shadow-sm shadow-rose-200'
                                                    : 'bg-slate-400'
                                            }`} />
                                            <span className="text-xs font-semibold text-slate-600 font-mono">
                                                {endpoint.status}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center space-x-2 mt-1.5">
                                        <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Globe size={12} />
                                        </div>
                                        <span className="truncate max-w-[150px]">{endpoint.name}</span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 font-mono text-xs max-w-xs truncate" title={endpoint.url}>
                                        {endpoint.url}
                                    </td>
                                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                        {endpoint.method}
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                                        Every {endpoint.interval} min
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <button
                                            onClick={() => navigate(`/monitors/${endpoint.id}`)}
                                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm"
                                        >
                                            Analysis
                                        </button>
                                        <button
                                            onClick={() => handleDelete(endpoint.id)}
                                            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all duration-150 cursor-pointer shadow-sm inline-flex items-center justify-center"
                                            title="Delete Monitor"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-mono text-xs">
                                    No endpoint health checks scheduled under this project.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

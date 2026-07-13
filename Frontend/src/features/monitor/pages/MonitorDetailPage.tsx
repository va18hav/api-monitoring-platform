import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetEndpoint, useGetResponses } from '../hooks/useMonitor';
import { UptimeStats } from '../components/UptimeStats';
import { LatencyChart } from '../components/LatencyChart';
import { CheckLogsTable } from '../components/CheckLogsTable';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export const MonitorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch endpoint metadata and responses log using custom hooks
    const { data: endpoint, isLoading: endpointLoading } = useGetEndpoint(id!);
    const { data: responses, isLoading: responsesLoading } = useGetResponses(id!);

    if (endpointLoading || responsesLoading || !endpoint) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-10 w-full animate-fade-in">
            {/* Header / Back Navigation */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(`/projects/${endpoint.projectId}`)}
                    className="p-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition-all duration-150 cursor-pointer shadow-sm"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-extrabold text-slate-900 truncate max-w-lg" title={endpoint.url}>
                            {endpoint.name}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                            endpoint.status === 'UP'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : endpoint.status === 'DOWN'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                            {endpoint.status}
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 font-mono">Target URL: {endpoint.url}</p>
                </div>
            </div>

            {/* Quick Metrics Bento Card Grid */}
            <UptimeStats responses={responses} />

            {/* SVG Latency Line Chart */}
            <LatencyChart responses={responses} />

            {/* Historical Check Logs Table */}
            <CheckLogsTable responses={responses} />
        </div>
    );
};

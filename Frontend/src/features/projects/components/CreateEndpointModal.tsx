import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useCreateEndpoint } from '../hooks/useProjects';

interface CreateEndpointModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export const CreateEndpointModal: React.FC<CreateEndpointModalProps> = ({ isOpen, onClose, projectId }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [interval, setInterval] = useState(5);

    const createEndpointMutation = useCreateEndpoint(projectId, () => {
        setName('');
        setUrl('');
        setInterval(5);
        onClose();
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url || !interval) return;
        createEndpointMutation.mutate({
            name,
            url,
            interval,
            projectId
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-8 shadow-xl space-y-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                    <X size={20} />
                </button>

                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Schedule Endpoint Monitor</h3>
                    <p className="text-slate-400 text-xs mt-1">Configure check intervals for database pings</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Monitor Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Auth Service Ping"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Target URL
                        </label>
                        <input
                            type="url"
                            required
                            placeholder="https://my-api.com/health"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Ping Interval (Minutes)
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            value={interval}
                            onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createEndpointMutation.isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4 shadow-sm"
                    >
                        {createEndpointMutation.isPending ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <Clock size={18} />
                                <span>Schedule Monitor</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

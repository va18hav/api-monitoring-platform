import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateProject } from '../hooks/useProjects';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const createProjectMutation = useCreateProject(() => {
        setName('');
        setDescription('');
        onClose();
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        createProjectMutation.mutate({ name, description });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-xl space-y-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                    <X size={20} />
                </button>

                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Create New Project</h3>
                    <p className="text-slate-400 text-xs mt-1">Group your microservice health checkers together</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Production APIs"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Description
                        </label>
                        <textarea
                            placeholder="Brief details about the project"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 h-24"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createProjectMutation.isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
                    >
                        {createProjectMutation.isPending ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <span>Create Project</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGetProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export const ProjectsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: projects, isLoading } = useGetProjects();

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-10 w-full animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Workspaces</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Group microservice targets and manage isolated environment checks
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 flex items-center space-x-2 shadow-sm shadow-blue-100 cursor-pointer"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Grid listings */}
            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <p className="text-slate-400 font-mono text-sm">
                        No projects created yet. Create a project to start configuring endpoints.
                    </p>
                </div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

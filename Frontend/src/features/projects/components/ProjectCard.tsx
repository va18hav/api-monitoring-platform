import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, ArrowRight } from 'lucide-react';
import type { Project } from '../types/project.types';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all duration-200">
            <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Folder size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{project.name}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {project.description && (
                    <p className="text-slate-500 text-sm line-clamp-2 min-h-10">
                        {project.description}
                    </p>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                    to={`/projects/${project.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5 transition-colors group"
                >
                    <span>Open Workspace</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

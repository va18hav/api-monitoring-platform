import { api } from '../../../shared/services/api';
import type { Project, Endpoint } from '../types/project.types';

export const projectService = {
    getProjects: async (): Promise<Project[]> => {
        const res = await api.get<{ data: Project[] }>('/project');
        return res.data.data;
    },

    createProject: async (data: { name: string; description?: string }): Promise<Project> => {
        const res = await api.post<{ data: Project }>('/project', data);
        return res.data.data;
    },

    deleteProject: async (id: string): Promise<void> => {
        await api.delete(`/project/${id}`);
    },

    getEndpoints: async (projectId: string): Promise<Endpoint[]> => {
        const res = await api.get<{ data: Endpoint[] }>(`/endpoint/project/${projectId}`);
        return res.data.data;
    },

    createEndpoint: async (data: {
        name: string;
        url: string;
        interval: number;
        projectId: string;
    }): Promise<Endpoint> => {
        const res = await api.post<{ data: Endpoint }>('/endpoint', data);
        return res.data.data;
    },

    deleteEndpoint: async (id: string): Promise<void> => {
        await api.delete(`/endpoint/${id}`);
    }
};

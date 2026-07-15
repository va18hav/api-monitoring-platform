import * as projectRepo from '../repositories/project.repository.js';
import { AppError } from '../lib/appError.js';
import { redis } from '../lib/redis.js';
import { logger } from 'shared';

export const createProject = async (userId: string, data: { name: string; description?: string | null }) => {
    return await projectRepo.createProject({
        name: data.name,
        description: data.description ?? undefined,
        userId
    });
};

export const getUserProjects = async (userId: string) => {
    return await projectRepo.findProjectsByUser(userId);
};

export const deleteProject = async (userId: string, projectId: string) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) throw new AppError(404, 'Project not found');
    if (project.userId !== userId) throw new AppError(403, 'Forbidden');

    await projectRepo.deleteProject(projectId);
};

export const getLastOpenedEndpoint = async (userId: string, projectId: string) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) throw new AppError(404, 'Project not found');
    if (project.userId !== userId) throw new AppError(403, 'Forbidden');

    const redisKey = `pingloop:last-opened:user:${userId}:project:${projectId}`;
    try {
        if (redis.status !== 'ready') {
            return null;
        }
        return await redis.get(redisKey);
    } catch (err) {
        logger.warn({ err }, `Failed to get last opened endpoint for project ${projectId}.`);
        return null;
    }
};

export const setLastOpenedEndpoint = async (userId: string, projectId: string, endpointId: string) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) throw new AppError(404, 'Project not found');
    if (project.userId !== userId) throw new AppError(403, 'Forbidden');

    const redisKey = `pingloop:last-opened:user:${userId}:project:${projectId}`;
    try {
        if (redis.status === 'ready') {
            await redis.set(redisKey, endpointId, 'EX', 30 * 24 * 60 * 60);
        }
    } catch (err) {
        logger.warn({ err }, `Failed to set last opened endpoint for project ${projectId}.`);
    }
};

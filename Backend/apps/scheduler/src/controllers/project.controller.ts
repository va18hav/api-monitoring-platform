import { Request, Response } from 'express';
import { createProjectSchema } from '../types/validation.types.js';
import * as projectService from '../services/project.service.js';
import { redis } from '../lib/redis.js';
import { logger } from 'shared';

export const createProject = async (req: Request, res: Response) => {
    const data = createProjectSchema.parse(req.body);
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const project = await projectService.createProject(req.userId, data);
    res.status(201).json({ success: true, data: project });
};

export const getUserProjects = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const projects = await projectService.getUserProjects(req.userId);
    res.status(200).json({ success: true, data: projects });
};

export const deleteProject = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await projectService.deleteProject(req.userId, req.params.id as string);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
};

export const getProjectCookies = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { projectId } = req.params;
    
    const redisKey = `pingloop:session:user:${req.userId}:project:${projectId}`;
    try {
        const cached = await redis.get(redisKey);
        if (cached) {
            return res.status(200).json({ success: true, data: JSON.parse(cached) });
        }
        return res.status(200).json({ success: true, data: [] });
    } catch (err) {
        logger.warn({ err }, `Failed to fetch cookies from Redis for project ${projectId}. Returning empty fallback.`);
        return res.status(200).json({ success: true, data: [], warning: 'Cookie storage is temporarily unavailable.' });
    }
};

export const deleteProjectCookies = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { projectId } = req.params;
    const { name } = req.query;
    
    const redisKey = `pingloop:session:user:${req.userId}:project:${projectId}`;
    try {
        if (name) {
            const cached = await redis.get(redisKey);
            if (cached) {
                const cookies = JSON.parse(cached);
                const filtered = cookies.filter((c: any) => c.name !== name);
                if (filtered.length > 0) {
                    await redis.set(redisKey, JSON.stringify(filtered), 'EX', 24 * 60 * 60);
                } else {
                    await redis.del(redisKey);
                }
            }
        } else {
            await redis.del(redisKey);
        }
        return res.status(200).json({ success: true, message: 'Cookies cleared successfully' });
    } catch (err) {
        logger.warn({ err }, `Failed to clear cookies from Redis for project ${projectId}.`);
        return res.status(200).json({ success: true, message: 'Cookie storage is temporarily unavailable, cookies cleared locally.', warning: 'Cookie storage is offline.' });
    }
};

export const getLastOpenedEndpoint = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const projectId = req.params.projectId as string;

    const endpointId = await projectService.getLastOpenedEndpoint(req.userId, projectId);
    return res.status(200).json({ success: true, data: { endpointId } });
};

export const setLastOpenedEndpoint = async (req: Request, res: Response) => {
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const projectId = req.params.projectId as string;
    const { endpointId } = req.body;

    if (!endpointId) {
        return res.status(400).json({ success: false, message: 'endpointId is required' });
    }

    await projectService.setLastOpenedEndpoint(req.userId, projectId, endpointId);
    return res.status(200).json({ success: true });
};

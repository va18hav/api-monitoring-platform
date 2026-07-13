import { Request, Response, NextFunction } from 'express';
import * as projectRepo from '../repositories/project.repository.js';
import { createProjectSchema } from '../types/validation.types.js';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = createProjectSchema.parse(req.body);
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const project = await projectRepo.createProject({
            name,
            description: description ?? undefined,
            userId
        });

        res.status(201).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
};

export const getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const projects = await projectRepo.findProjectsByUser(userId);
        res.status(200).json({ success: true, data: projects });
    } catch (err) {
        next(err);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const project = await projectRepo.findProjectById(id as string);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        if (project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        await projectRepo.deleteProject(id as string);
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        next(err);
    }
};

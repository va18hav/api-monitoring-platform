import { Request, Response, NextFunction } from 'express';
import * as endpointRepo from '../repositories/endpoint.repository.js';
import * as projectRepo from '../repositories/project.repository.js';
import * as jobService from '../services/job.service.js';
import { prisma } from 'db';
import { createEndpointSchema } from '../types/validation.types.js';

export const createEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, url, interval, projectId } = createEndpointSchema.parse(req.body);
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const project = await projectRepo.findProjectById(projectId);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        if (project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        // 1. Create Endpoint database record
        const endpoint = await endpointRepo.createEndpoint({
            name,
            url,
            interval,
            projectId
        });

        // 2. Schedule repeatable check in BullMQ via jobService
        const scheduledJob = await jobService.addScheduledJob({
            type: 'ping_endpoint',
            payload: { endpointId: endpoint.id },
            schedule: 'every-x-minutes',
            minutes: interval,
            userId
        });

        // 3. Store the repeatable job key on the endpoint record for cancellation
        let repeatKey: string | null = null;
        if (scheduledJob && scheduledJob.repeatJobKey) {
            repeatKey = scheduledJob.repeatJobKey;
            await endpointRepo.updateEndpointRepeatKey(endpoint.id, repeatKey);
        }

        res.status(201).json({ 
            success: true, 
            data: { 
                ...endpoint, 
                repeatJobKey: repeatKey 
            } 
        });
    } catch (err) {
        next(err);
    }
};

export const getProjectEndpoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const project = await projectRepo.findProjectById(projectId as string);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        if (project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        const endpoints = await endpointRepo.findEndpointsByProject(projectId as string);
        res.status(200).json({ success: true, data: endpoints });
    } catch (err) {
        next(err);
    }
};

export const deleteEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const endpoint = await endpointRepo.findEndpointById(id as string);
        if (!endpoint) {
            res.status(404).json({ success: false, message: 'Endpoint not found' });
            return;
        }

        if (endpoint.project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        // 1. Remove repeatable schedule from BullMQ queue if it exists
        if (endpoint.repeatJobKey) {
            await jobService.removeScheduledJob(endpoint.repeatJobKey);
        }

        // 2. Delete Endpoint record from database
        await endpointRepo.deleteEndpoint(id as string);
        res.status(200).json({ success: true, message: 'Endpoint deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const getEndpointResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const endpoint = await endpointRepo.findEndpointById(id as string);
        if (!endpoint) {
            res.status(404).json({ success: false, message: 'Endpoint not found' });
            return;
        }

        if (endpoint.project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        const responses = await prisma.response.findMany({
            where: { endpointId: id as string },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.status(200).json({ success: true, data: responses });
    } catch (err) {
        next(err);
    }
};

export const getEndpointDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const endpoint = await endpointRepo.findEndpointById(id as string);
        if (!endpoint) {
            res.status(404).json({ success: false, message: 'Endpoint not found' });
            return;
        }

        if (endpoint.project.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        res.status(200).json({ success: true, data: endpoint });
    } catch (err) {
        next(err);
    }
};

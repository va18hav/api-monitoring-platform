import { Request, Response } from 'express';
import * as monitorService from '../services/monitor.service.js';
import { createMonitorSchema } from '../types/validation.types.js';

export const createMonitor = async (req: Request, res: Response) => {
    const data = createMonitorSchema.parse(req.body);
    if (!req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const monitor = await monitorService.createMonitor(req.userId, data);
    res.status(201).json({ success: true, data: monitor });
};

export const deleteMonitor = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await monitorService.deleteMonitor(req.userId, id as string);
    res.status(200).json({ success: true, message: 'Monitor deleted successfully' });
};

export const getMonitorAuthStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const status = await monitorService.getMonitorAuthStatus(req.userId, id as string);
    res.status(200).json({ success: true, data: status });
};

export const syncMonitorSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await monitorService.syncMonitorSession(req.userId, id as string);
    res.status(200).json({ success: true, message: 'Monitor session synchronized successfully' });
};

export const updateMonitor = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { interval } = req.body;
    if (!id || !req.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!interval || typeof interval !== 'number') {
        return res.status(400).json({ success: false, message: 'Interval must be a valid number' });
    }

    const monitor = await monitorService.updateMonitor(req.userId, id as string, interval);
    res.status(200).json({ success: true, data: monitor });
};

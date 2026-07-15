import { ScheduleJobInput } from "../types/job.types.js";
import { jobQueue } from '../lib/queue.js';
import { prisma } from 'db';
import { redis } from '../lib/redis.js';
import { logger } from 'shared';

export const addScheduledJob = async (data: ScheduleJobInput) => {
    const repeatOpts = getRepeatOpts(data);
    const maxRetries = parseInt(process.env.MAX_RETRIES || '5', 10);
    
    // Add job to BullMQ queue
    // For repeatable jobs, flag them as isRecurring so the worker dynamically logs each execution run.
    return await jobQueue.add(
        data.type,
        { payload: data.payload, isRecurring: true, userId: data.userId },
        {
            jobId: data.payload?.endpointId ? `${data.type}_${data.payload.endpointId}` : undefined,
            repeat: repeatOpts,
            attempts: maxRetries + 1,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        }
    );
}

const getRepeatOpts = (data: ScheduleJobInput) => {
    let repeatOpts: any = {};
    if (data.schedule === 'daily') {
        repeatOpts = { pattern: '0 0 * * *' };
    } else if (data.schedule === 'hourly') {
        repeatOpts = { pattern: '0 * * * *' };
    } else if (data.schedule === 'every-x-minutes') {
        if (data.minutes === undefined || data.minutes <= 0) {
            throw new Error("Minutes value must be greater than 0 for 'every-x-minutes' schedule.");
        }
        repeatOpts = { every: data.minutes * 60 * 1000 };
    } else if (data.schedule === 'cron') {
        if (!data.cronPattern) {
            throw new Error("Cron pattern is required for 'cron' schedule.");
        }
        repeatOpts = { pattern: data.cronPattern };
    } else {
        throw new Error("Invalid schedule option. Must be 'daily', 'hourly', 'every-x-minutes', or 'cron'.");
    }
    return repeatOpts;
}

export const getScheduledJobs = async () => {
    return await jobQueue.getRepeatableJobs();
}

export const removeScheduledJob = async (key: string) => {
    return await jobQueue.removeRepeatableByKey(key);
}

export const syncDatabaseMonitorsWithQueue = async () => {
    const monitors = await prisma.monitor.findMany({
        include: {
            endpoint: {
                include: {
                    project: { select: { userId: true } }
                }
            }
        }
    });

    const repeatableJobs = await jobQueue.getRepeatableJobs();
    const repeatableKeys = new Set(repeatableJobs.map(job => job.key));

    for (const monitor of monitors) {
        if (!monitor.repeatJobKey || !repeatableKeys.has(monitor.repeatJobKey)) {
            try {
                const scheduledJob = await addScheduledJob({
                    type: 'ping_endpoint',
                    payload: { endpointId: monitor.endpointId, monitorId: monitor.id },
                    schedule: 'every-x-minutes',
                    minutes: monitor.interval,
                    userId: monitor.endpoint.project.userId
                });

                if (scheduledJob && scheduledJob.repeatJobKey) {
                    await prisma.monitor.update({
                        where: { id: monitor.id },
                        data: { repeatJobKey: scheduledJob.repeatJobKey }
                    });
                }
            } catch (err) {
                console.error(`Failed to synchronize monitor ${monitor.id}:`, err);
            }
        }
    }
};

import * as monitorRepo from '../repositories/monitor.repository.js';
import * as endpointRepo from '../repositories/endpoint.repository.js';
import { AppError } from '../lib/appError.js';

export const createMonitor = async (userId: string, data: { endpointId: string; interval: number }) => {
    const endpoint = await endpointRepo.findEndpointById(data.endpointId);
    if (!endpoint) throw new AppError(404, 'Endpoint not found');
    if (endpoint.project.userId !== userId) throw new AppError(403, 'Forbidden');

    const monitor = await monitorRepo.createMonitor(data);

    // Copy active workspace session cookies to monitor session store aligning TTL
    const userCookiesKey = `pingloop:session:user:${userId}:project:${endpoint.projectId}`;
    const monitorCookiesKey = `pingloop:session:monitor:${endpoint.id}`;
    try {
        if (redis.status === 'ready') {
            const ttl = await redis.ttl(userCookiesKey);
            if (ttl > 0) {
                const userCookies = await redis.get(userCookiesKey);
                if (userCookies) {
                    await redis.set(monitorCookiesKey, userCookies, 'EX', ttl);
                }
            }
        }
    } catch (err) {
        logger.warn({ err }, `Failed to copy initial cookies for monitor of endpoint ${endpoint.id}.`);
    }

    const scheduledJob = await addScheduledJob({
        type: 'ping_endpoint',
        payload: { endpointId: endpoint.id, monitorId: monitor.id },
        schedule: 'every-x-minutes',
        minutes: data.interval,
        userId
    });

    let repeatKey: string | null = null;
    if (scheduledJob && scheduledJob.repeatJobKey) {
        repeatKey = scheduledJob.repeatJobKey;
        await monitorRepo.updateMonitorRepeatKey(monitor.id, repeatKey);
    }

    return { ...monitor, repeatJobKey: repeatKey };
};

export const deleteMonitor = async (userId: string, monitorId: string) => {
    const monitor = await monitorRepo.findMonitorById(monitorId);
    if (!monitor) throw new AppError(404, 'Monitor not found');
    if (monitor.endpoint.project.userId !== userId) throw new AppError(403, 'Forbidden');

    if (monitor.repeatJobKey) {
        await removeScheduledJob(monitor.repeatJobKey);
    }

    await monitorRepo.deleteMonitor(monitorId);
};

export const getMonitorAuthStatus = async (userId: string, monitorId: string) => {
    const monitor = await monitorRepo.findMonitorById(monitorId);
    if (!monitor) throw new AppError(404, 'Monitor not found');
    if (monitor.endpoint.project.userId !== userId) throw new AppError(403, 'Forbidden');

    const endpoint = monitor.endpoint;
    const auth = endpoint.auth as any;
    const isCookieAuth = auth && auth.type === 'cookie';

    if (!isCookieAuth) {
        return { status: 'none', ttl: 0, interval: monitor.interval };
    }

    const monitorCookiesKey = `pingloop:session:monitor:${endpoint.id}`;
    try {
        if (redis.status !== 'ready') {
            return { status: 'none', ttl: 0, interval: monitor.interval };
        }
        const ttl = await redis.ttl(monitorCookiesKey);
        if (ttl <= 0) {
            return { status: 'expired', ttl: 0, interval: monitor.interval };
        }
        
        // expiring if TTL is less than double interval
        const threshold = monitor.interval * 60 * 2;
        if (ttl < threshold) {
            return { status: 'expiring', ttl, interval: monitor.interval };
        }
        return { status: 'valid', ttl, interval: monitor.interval };
    } catch (err) {
        logger.warn({ err }, `Failed to check cookie status for monitor ${monitorId}`);
        return { status: 'expired', ttl: 0, interval: monitor.interval };
    }
};

export const syncMonitorSession = async (userId: string, monitorId: string) => {
    const monitor = await monitorRepo.findMonitorById(monitorId);
    if (!monitor) throw new AppError(404, 'Monitor not found');
    if (monitor.endpoint.project.userId !== userId) throw new AppError(403, 'Forbidden');

    const endpoint = monitor.endpoint;
    const userCookiesKey = `pingloop:session:user:${userId}:project:${endpoint.projectId}`;
    const monitorCookiesKey = `pingloop:session:monitor:${endpoint.id}`;

    try {
        if (redis.status !== 'ready') {
            throw new AppError(503, 'Redis cache offline');
        }
        const ttl = await redis.ttl(userCookiesKey);
        if (ttl <= 0) {
            throw new AppError(400, 'No active workspace session found. Please run a successful request first.');
        }
        const userCookies = await redis.get(userCookiesKey);
        if (!userCookies) {
            throw new AppError(400, 'Workspace session cookies are empty. Please run a successful request first.');
        }
        await redis.set(monitorCookiesKey, userCookies, 'EX', ttl);
    } catch (err) {
        if (err instanceof AppError) throw err;
        logger.warn({ err }, `Failed to sync session for monitor ${monitorId}`);
        throw new AppError(500, 'Failed to sync session');
    }
};

export const updateMonitor = async (userId: string, monitorId: string, interval: number) => {
    const monitor = await monitorRepo.findMonitorById(monitorId);
    if (!monitor) throw new AppError(404, 'Monitor not found');
    if (monitor.endpoint.project.userId !== userId) throw new AppError(403, 'Forbidden');

    // Remove old repeatable job schedule
    if (monitor.repeatJobKey) {
        await removeScheduledJob(monitor.repeatJobKey);
    }

    // Add new repeatable job schedule
    const scheduledJob = await addScheduledJob({
        type: 'ping_endpoint',
        payload: { endpointId: monitor.endpointId, monitorId: monitor.id },
        schedule: 'every-x-minutes',
        minutes: interval,
        userId
    });

    let repeatKey: string | null = null;
    if (scheduledJob && scheduledJob.repeatJobKey) {
        repeatKey = scheduledJob.repeatJobKey;
    }

    // Update interval and BullMQ repeat key in DB
    return await prisma.monitor.update({
        where: { id: monitorId },
        data: {
            interval,
            repeatJobKey: repeatKey
        }
    });
};
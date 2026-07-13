import { ScheduleJobInput } from "../types/job.types.js";
import { jobQueue } from '../lib/queue.js';
import { prisma } from 'db';

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

export const syncDatabaseEndpointsWithQueue = async () => {
    const endpoints = await prisma.endpoint.findMany({
        include: {
            project: {
                select: {
                    userId: true
                }
            }
        }
    });

    const repeatableJobs = await jobQueue.getRepeatableJobs();
    const repeatableKeys = new Set(repeatableJobs.map(job => job.key));

    for (const endpoint of endpoints) {
        if (!endpoint.repeatJobKey || !repeatableKeys.has(endpoint.repeatJobKey)) {
            try {
                // If it was already in Redis under the old format or missing, reschedule it
                const scheduledJob = await addScheduledJob({
                    type: 'ping_endpoint',
                    payload: { endpointId: endpoint.id },
                    schedule: 'every-x-minutes',
                    minutes: endpoint.interval,
                    userId: endpoint.project.userId
                });

                if (scheduledJob && scheduledJob.repeatJobKey) {
                    await prisma.endpoint.update({
                        where: { id: endpoint.id },
                        data: { repeatJobKey: scheduledJob.repeatJobKey }
                    });
                }
            } catch (err) {
                console.error(`Failed to synchronize endpoint ${endpoint.id}:`, err);
            }
        }
    }
};
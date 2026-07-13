import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { addScheduledJob, syncDatabaseEndpointsWithQueue } from './job.service.js';
import { jobQueue } from '../lib/queue.js';
import { prisma } from 'db';

// 1. Module mocks for queues and databases
jest.mock('../lib/queue', () => ({
    jobQueue: {
        add: jest.fn(),
        getRepeatableJobs: jest.fn()
    }
}));

jest.mock('db', () => ({
    prisma: {
        endpoint: {
            findMany: jest.fn(),
            update: jest.fn()
        }
    }
}));

describe('Scheduler Job Service - Queue Scheduling & Sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addScheduledJob()', () => {
        it('should correctly configure repeatable parameters and include a unique jobId based on endpoint ID', async () => {
            // Arrange
            const mockInput = {
                type: 'ping_endpoint',
                payload: { endpointId: 'endpoint-abc' },
                schedule: 'every-x-minutes' as const,
                minutes: 10,
                userId: 'user-789'
            };

            (jobQueue.add as any).mockResolvedValue({
                id: 'job-111',
                repeatJobKey: 'repeat:ping_endpoint_endpoint-abc:every-10-mins'
            });

            // Act
            const result = await addScheduledJob(mockInput);

            // Assert: Job enqueued with correct name and data payload
            expect(jobQueue.add).toHaveBeenCalledWith(
                'ping_endpoint',
                { payload: { endpointId: 'endpoint-abc' }, isRecurring: true, userId: 'user-789' },
                expect.objectContaining({
                    jobId: 'ping_endpoint_endpoint-abc', // Unique jobId verified
                    repeat: { every: 10 * 60 * 1000 },  // Conversion to ms verified
                    attempts: 6,
                    backoff: {
                        type: 'exponential',
                        delay: 5000
                    }
                })
            );

            expect(result).toEqual(expect.objectContaining({
                repeatJobKey: 'repeat:ping_endpoint_endpoint-abc:every-10-mins'
            }));
        });

        it('should fail with error if schedule configuration lacks required variables', async () => {
            // Arrange: Invalid every-x-minutes configuration
            const mockInput = {
                type: 'ping_endpoint',
                payload: { endpointId: 'endpoint-abc' },
                schedule: 'every-x-minutes' as const,
                minutes: 0, // Invalid minutes value
                userId: 'user-789'
            };

            // Act & Assert
            await expect(addScheduledJob(mockInput)).rejects.toThrow(
                "Minutes value must be greater than 0 for 'every-x-minutes' schedule."
            );
            expect(jobQueue.add).not.toHaveBeenCalled();
        });
    });

    describe('syncDatabaseEndpointsWithQueue()', () => {
        it('should detect missing repeatable checks in Redis and automatically schedule them', async () => {
            // Arrange: DB contains an endpoint, but Redis queue is empty
            const mockEndpoint = {
                id: 'endpoint-abc',
                name: 'Main Check',
                url: 'http://test.com',
                interval: 2,
                repeatJobKey: 'repeat:key-stale-or-empty',
                project: {
                    userId: 'user-789'
                }
            };

            (prisma.endpoint.findMany as any).mockResolvedValue([mockEndpoint]);
            (jobQueue.getRepeatableJobs as any).mockResolvedValue([]); // Redis repeatable jobs list is empty

            (jobQueue.add as any).mockResolvedValue({
                repeatJobKey: 'repeat:key-new-generated-uuid'
            });

            // Act
            await syncDatabaseEndpointsWithQueue();

            // Assert: Job rescheduled with unique jobId
            expect(jobQueue.add).toHaveBeenCalledWith(
                'ping_endpoint',
                { payload: { endpointId: 'endpoint-abc' }, isRecurring: true, userId: 'user-789' },
                expect.objectContaining({
                    jobId: 'ping_endpoint_endpoint-abc',
                    repeat: { every: 2 * 60 * 1000 }
                })
            );

            // Assert: Rescheduled key updated in database
            expect(prisma.endpoint.update).toHaveBeenCalledWith({
                where: { id: 'endpoint-abc' },
                data: { repeatJobKey: 'repeat:key-new-generated-uuid' }
            });
        });

        it('should skip synchronization if the endpoint configuration is already registered in Redis repeatable jobs list', async () => {
            // Arrange: Database keys match active keys in Redis repeatable logs
            const mockEndpoint = {
                id: 'endpoint-abc',
                name: 'Main Check',
                url: 'http://test.com',
                interval: 2,
                repeatJobKey: 'repeat:active-key-123',
                project: {
                    userId: 'user-789'
                }
            };

            (prisma.endpoint.findMany as any).mockResolvedValue([mockEndpoint]);
            
            // Redis already contains the matching repeatable key
            (jobQueue.getRepeatableJobs as any).mockResolvedValue([
                { key: 'repeat:active-key-123' }
            ]);

            // Act
            await syncDatabaseEndpointsWithQueue();

            // Assert: Verify sync execution skipped
            expect(jobQueue.add).not.toHaveBeenCalled();
            expect(prisma.endpoint.update).not.toHaveBeenCalled();
        });
    });
});

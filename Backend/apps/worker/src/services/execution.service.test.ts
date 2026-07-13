import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { executeJob } from './execution.service.js';
import { createResponse } from '../repositories/response.repository.js';
import { prisma } from 'db';
import { jobQueue } from '../lib/queue.js';

// 1. Decoupled module mocks for external infrastructure dependencies
jest.mock('db', () => ({
    prisma: {
        endpoint: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}));

jest.mock('../repositories/response.repository', () => ({
    createResponse: jest.fn()
}));

jest.mock('../lib/queue', () => ({
    jobQueue: {
        add: jest.fn()
    }
}));

// Mock the global fetch function
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Worker Execution Service - Uptime Health Checks', () => {
    const mockJob = {
        id: 'job-123',
        type: 'ping_endpoint',
        payload: { endpointId: 'endpoint-456' },
        userId: 'user-789'
    };

    const mockEndpointDbRecord = {
        id: 'endpoint-456',
        name: 'Production Auth API',
        url: 'https://auth.company.com/health',
        method: 'GET',
        interval: 5,
        status: 'PENDING',
        projectId: 'project-abc',
        repeatJobKey: 'repeat-key-xyz',
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
            userId: 'user-789',
            user: {
                id: 'user-789',
                email: 'dev-ops@company.com',
                password: 'hashed-password',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
    });

    it('should complete check successfully, update status to UP, and log response', async () => {
        // Arrange
        (prisma.endpoint.findUnique as any).mockResolvedValue(mockEndpointDbRecord);
        
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers(),
        } as Response);

        // Act
        await executeJob(mockJob);

        // Assert: Endpoint config queried
        expect(prisma.endpoint.findUnique).toHaveBeenCalledWith({
            where: { id: 'endpoint-456' },
            include: expect.any(Object)
        });

        // Assert: Fetch request targeted the correct URL and method
        expect(mockFetch).toHaveBeenCalledWith('https://auth.company.com/health', {
            method: 'GET',
            signal: expect.any(AbortSignal),
            headers: {
                'User-Agent': 'API-Monitoring-Worker/1.0'
            }
        });

        // Assert: Log response saved in DB
        expect(createResponse).toHaveBeenCalledWith({
            endpointId: 'endpoint-456',
            statusCode: 200,
            responseTime: expect.any(Number),
            status: 'UP',
            error: null
        });

        // Assert: Endpoint status updated in Postgres
        expect(prisma.endpoint.update).toHaveBeenCalledWith({
            where: { id: 'endpoint-456' },
            data: { status: 'UP' }
        });

        // Assert: No failure email alert enqueued
        expect(jobQueue.add).not.toHaveBeenCalled();
    });

    it('should log status as DOWN and enqueue email alert job if target returns HTTP error status', async () => {
        // Arrange
        (prisma.endpoint.findUnique as any).mockResolvedValue(mockEndpointDbRecord);
        
        mockFetch.mockResolvedValue({
            ok: false,
            status: 503,
            headers: new Headers(),
        } as Response);

        // Act
        await executeJob(mockJob);

        // Assert: Response log saved as DOWN with status code error
        expect(createResponse).toHaveBeenCalledWith({
            endpointId: 'endpoint-456',
            statusCode: 503,
            responseTime: expect.any(Number),
            status: 'DOWN',
            error: 'HTTP Error Status: 503'
        });

        // Assert: Status set to DOWN
        expect(prisma.endpoint.update).toHaveBeenCalledWith({
            where: { id: 'endpoint-456' },
            data: { status: 'DOWN' }
        });

        // Assert: Email alert enqueued in background job queue
        expect(jobQueue.add).toHaveBeenCalledWith('send_email', {
            to: 'dev-ops@company.com',
            subject: '⚠️ Alert: Monitor DOWN - https://auth.company.com/health',
            body: expect.stringContaining('Status Code: 503'),
            userId: 'user-789'
        });
    });

    it('should mark status as DOWN and enqueue email alert on request network timeout', async () => {
        // Arrange
        (prisma.endpoint.findUnique as any).mockResolvedValue(mockEndpointDbRecord);
        
        // Simulate abort/timeout exception
        mockFetch.mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

        // Act
        await executeJob(mockJob);

        // Assert: Log response saved as DOWN with DOM timeout exception text
        expect(createResponse).toHaveBeenCalledWith({
            endpointId: 'endpoint-456',
            statusCode: null,
            responseTime: expect.any(Number),
            status: 'DOWN',
            error: 'The user aborted a request.'
        });

        expect(prisma.endpoint.update).toHaveBeenCalledWith({
            where: { id: 'endpoint-456' },
            data: { status: 'DOWN' }
        });

        // Assert: Email alert enqueued
        expect(jobQueue.add).toHaveBeenCalledWith('send_email', {
            to: 'dev-ops@company.com',
            subject: '⚠️ Alert: Monitor DOWN - https://auth.company.com/health',
            body: expect.stringContaining('Error: The user aborted a request.'),
            userId: 'user-789'
        });
    });

    it('should skip check gracefully if endpoint configuration is not found in database', async () => {
        // Arrange
        (prisma.endpoint.findUnique as any).mockResolvedValue(null);

        // Act
        await executeJob(mockJob);

        // Assert: Verify execution skipped
        expect(mockFetch).not.toHaveBeenCalled();
        expect(createResponse).not.toHaveBeenCalled();
        expect(prisma.endpoint.update).not.toHaveBeenCalled();
        expect(jobQueue.add).not.toHaveBeenCalled();
    });
});

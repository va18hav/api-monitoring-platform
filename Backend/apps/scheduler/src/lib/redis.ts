import { Redis } from 'ioredis';
import { logger } from 'shared';

const retryStrategy = (times: number) => {
    // Exponential backoff capped at 3 seconds (3000ms)
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis connection lost. Retrying in ${delay}ms (attempt #${times})`);
    return delay;
};

const getRedisClient = (): Redis => {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        return new Redis(redisUrl, { retryStrategy, enableOfflineQueue: false });
    }
    return new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        retryStrategy,
        enableOfflineQueue: false
    });
};

export const redis = getRedisClient();

// Prevent Node from crashing by registering an error listener
redis.on('error', (err) => {
    logger.error({ err }, "Redis client encountered a connection error");
});

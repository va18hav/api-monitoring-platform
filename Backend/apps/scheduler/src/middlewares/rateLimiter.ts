import rateLimit, { Store, ClientRateLimitInfo } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis.js';
import { logger } from 'shared';

class FallbackStore implements Store {
    private redisStore: RedisStore;
    private memoryStore = new Map<string, { count: number; resetTime: Date }>();
    prefix: string;
    private windowMs: number;

    constructor(prefix: string, windowMs: number) {
        this.prefix = prefix;
        this.windowMs = windowMs;
        this.redisStore = new RedisStore({
            sendCommand: async (...args: string[]) => {
                if (redis.status !== 'ready') {
                    throw new Error('Redis client is not ready');
                }
                const res = await redis.call(args[0], ...args.slice(1));
                if (res === null || res === undefined) {
                    throw new Error('Redis command returned null or undefined');
                }
                return res as any;
            },
            prefix: this.prefix
        });
    }

    private incrementMemory(key: string): ClientRateLimitInfo {
        const now = Date.now();
        const existing = this.memoryStore.get(key);
        
        if (existing && existing.resetTime.getTime() > now) {
            existing.count += 1;
            return {
                totalHits: existing.count,
                resetTime: existing.resetTime
            };
        } else {
            const resetTime = new Date(now + this.windowMs);
            const entry = { count: 1, resetTime };
            this.memoryStore.set(key, entry);
            return {
                totalHits: 1,
                resetTime
            };
        }
    }

    private decrementMemory(key: string): void {
        const existing = this.memoryStore.get(key);
        if (existing && existing.count > 0) {
            existing.count -= 1;
        }
    }

    private resetKeyMemory(key: string): void {
        this.memoryStore.delete(key);
    }

    private cleanExpired() {
        const now = Date.now();
        for (const [key, value] of this.memoryStore.entries()) {
            if (value.resetTime.getTime() <= now) {
                this.memoryStore.delete(key);
            }
        }
    }

    async increment(key: string): Promise<ClientRateLimitInfo> {
        if (redis.status !== 'ready') {
            this.cleanExpired();
            return this.incrementMemory(key);
        }

        try {
            return await this.redisStore.increment(key);
        } catch (err) {
            logger.warn({ err }, `Redis rate limit failed for prefix ${this.prefix}, falling back to local memory`);
            this.cleanExpired();
            return this.incrementMemory(key);
        }
    }

    async decrement(key: string): Promise<void> {
        if (redis.status !== 'ready') {
            this.decrementMemory(key);
            return;
        }

        try {
            await this.redisStore.decrement(key);
        } catch (err) {
            this.decrementMemory(key);
        }
    }

    async resetKey(key: string): Promise<void> {
        if (redis.status !== 'ready') {
            this.resetKeyMemory(key);
            return;
        }

        try {
            await this.redisStore.resetKey(key);
        } catch (err) {
            this.resetKeyMemory(key);
        }
    }
}

/**
 * Strict limiter for authentication routes (login, register).
 * Prevents brute-force and account spam attacks.
 * Key: IP address
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many attempts from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new FallbackStore('rl:auth:', 15 * 60 * 1000)
});

/**
 * Medium limiter for the one-time test ping endpoint.
 * Prevents queue flooding from a single developer.
 * Key: authenticated userId (fairer than IP for shared office networks)
 */
export const testPingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: 'Too many test pings. Please slow down — limit is 30 per minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userId || req.ip || 'anonymous',
    store: new FallbackStore('rl:test:', 60 * 1000)
});

/**
 * General loose safety-net limiter for all other API routes.
 * Catches runaway scripts or buggy frontends.
 * Key: IP address
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new FallbackStore('rl:general:', 60 * 1000)
});

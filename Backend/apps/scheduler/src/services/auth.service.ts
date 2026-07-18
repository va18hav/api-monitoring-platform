import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { logger } from 'shared';
import * as authRepo from '../repositories/auth.repository.js';
import { AppError } from '../lib/appError.js';
import { redis } from '../lib/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123';

export const registerUser = async (email: string, passwordPlain: string) => {
    const existingUser = await authRepo.findUserByEmail(email);
    if (existingUser) {
        throw new AppError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const user = await authRepo.createUser(email, hashedPassword);

    const token = jwt.sign({ userId: user.id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '1d' });

    return { user, token };
};

export const loginUser = async (email: string, passwordPlain: string) => {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        throw new AppError(400, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(passwordPlain, user.password);
    if (!isValidPassword) {
        throw new AppError(400, 'Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '1d' });

    return { user: { id: user.id, email: user.email, isVerified: user.isVerified }, token };
};

export const getUserById = async (id: string) => {
    const user = await authRepo.findUserById(id);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    return user;
};

export const sendOtp = async (userId: string) => {
    const user = await authRepo.findUserById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    // Rate limiting: max 5 requests per 10 minutes (600 seconds)
    const limitKey = `otp-limit:${userId}`;
    const requests = await redis.incr(limitKey);
    const ttl = await redis.ttl(limitKey);
    if (ttl === -1) {
        await redis.expire(limitKey, 600);
    }
    if (requests > 5) {
        throw new AppError(429, 'Too many OTP requests. Please wait up to 10 minutes before requesting another OTP.');
    }

    // Generate 4-digit OTP code (e.g. "4829")
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Redis with 5 minutes (300 seconds) TTL
    await redis.set(`otp:${userId}`, otp, 'EX', 300);

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
        // Fallback safety for development context if API key isn't provided
        logger.warn(`RESEND_API_KEY is not set. Verification OTP: ${otp}`);
        throw new AppError(500, 'Email service is not configured (RESEND_API_KEY missing)');
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'PingLoop <onboarding@resend.dev>',
            to: user.email,
            subject: 'Verify your PingLoop email address',
            html: `
                <div style="font-family: sans-serif; padding: 24px; max-width: 600px; color: #334155;">
                    <h2 style="color: #2563eb;">Verify your email</h2>
                    <p>Thank you for using PingLoop! Please verify your email address by entering the following 4-digit code:</p>
                    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 24px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #64748b;">This verification code is valid for 5 minutes. If you did not request this code, you can safely ignore this email.</p>
                </div>
            `
        });
        logger.info(`Verification OTP sent successfully to ${user.email}`);
    } catch (err: any) {
        logger.error({ err }, `Resend email dispatch failed for user ${userId}`);
        throw new AppError(500, `Failed to send email: ${err.message || 'Unknown error'}`);
    }
};

export const verifyOtp = async (userId: string, code: string) => {
    const storedOtp = await redis.get(`otp:${userId}`);
    if (!storedOtp) {
        throw new AppError(400, 'Verification code expired. Please request a new one.');
    }
    if (storedOtp !== code) {
        throw new AppError(400, 'Invalid verification code');
    }

    // Delete OTP from Redis immediately on success
    await redis.del(`otp:${userId}`);

    // Update verified status in DB
    const updatedUser = await authRepo.verifyUser(userId);
    return updatedUser;
};

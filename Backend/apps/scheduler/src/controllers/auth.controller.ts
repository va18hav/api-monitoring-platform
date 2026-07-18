import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, verifyOtpSchema } from '../types/validation.types.js';
import * as authService from '../services/auth.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123';

export const register = async (req: Request, res: Response) => {
    const { email, password } = registerSchema.parse(req.body);

    const { user, token } = await authService.registerUser(email, password);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const { user, token } = await authService.loginUser(email, password);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: user
    });
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    const user = await authService.getUserById(req.userId);

    res.status(200).json({ success: true, data: user });
};

export const sendOtp = async (req: Request, res: Response) => {
    if (!req.userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    await authService.sendOtp(req.userId);

    res.status(200).json({
        success: true,
        message: 'Verification code sent successfully'
    });
};

export const verifyOtp = async (req: Request, res: Response) => {
    if (!req.userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    const { code } = verifyOtpSchema.parse(req.body);

    const user = await authService.verifyOtp(req.userId, code);

    // Re-issue cookie with updated token containing isVerified: true
    const token = jwt.sign({ userId: user.id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '1d' });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: user
    });
};

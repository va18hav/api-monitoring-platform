import { api } from '../../../shared/services/api';
import type { AuthResponse, VerifySessionResponse } from '../types/auth.types';

export const authService = {
    login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('/auth/login', credentials);
        return res.data;
    },

    register: async (credentials: Record<string, string>): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('/auth/register', credentials);
        return res.data;
    },

    logout: async (): Promise<{ success: boolean; message: string }> => {
        const res = await api.post<{ success: boolean; message: string }>('/auth/logout');
        return res.data;
    },

    getMe: async (): Promise<VerifySessionResponse> => {
        const res = await api.get<VerifySessionResponse>('/auth/me');
        return res.data;
    },

    sendOtp: async (): Promise<{ success: boolean; message: string }> => {
        const res = await api.post<{ success: boolean; message: string }>('/auth/send-otp');
        return res.data;
    },

    verifyOtp: async (code: string): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('/auth/verify-otp', { code });
        return res.data;
    }
};

import { api } from '../../../shared/services/api';
import type { MonitorStats } from '../types/dashboard.types';

export const dashboardService = {
    getStats: async (): Promise<MonitorStats> => {
        const res = await api.get<{ data: MonitorStats }>('/stats');
        return res.data.data;
    }
};

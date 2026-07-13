import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useGetStats = () => {
    return useQuery({
        queryKey: ['stats'],
        queryFn: dashboardService.getStats,
        refetchInterval: 10000 // Refetch stats every 10 seconds
    });
};

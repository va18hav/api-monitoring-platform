import { useQuery } from '@tanstack/react-query';
import { monitorService } from '../services/monitorService';

export const useGetEndpoint = (id: string) => {
    return useQuery({
        queryKey: ['endpoint', id],
        queryFn: () => monitorService.getEndpointDetails(id),
        enabled: !!id
    });
};

export const useGetResponses = (id: string) => {
    return useQuery({
        queryKey: ['responses', id],
        queryFn: () => monitorService.getResponses(id),
        enabled: !!id,
        refetchInterval: 10000 // Poll responses every 10 seconds
    });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCreateMonitor = (projectId: string, onSuccessCb?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: monitorService.createMonitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endpoints', projectId] });
            toast.success('Live monitor activated successfully!');
            if (onSuccessCb) onSuccessCb();
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || 'Failed to activate monitor';
            toast.error(message);
        }
    });
};

export const useDeleteMonitor = (projectId: string, onSuccessCb?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: monitorService.deleteMonitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endpoints', projectId] });
            toast.success('Live monitor stopped successfully');
            if (onSuccessCb) onSuccessCb();
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || 'Failed to stop monitor';
            toast.error(message);
        }
    });
};

export const useGetMonitorAuthStatus = (monitorId: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['monitor-auth-status', monitorId],
        queryFn: () => monitorService.getMonitorAuthStatus(monitorId),
        enabled: enabled && !!monitorId,
        refetchInterval: 15000 // Refetch TTL status every 15 seconds
    });
};

export const useSyncMonitorSession = (monitorId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => monitorService.syncMonitorSession(monitorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitor-auth-status', monitorId] });
            toast.success('Workspace session cookies successfully synced to background monitor.');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || 'Failed to sync session cookies';
            toast.error(message);
        }
    });
};

export const useUpdateMonitor = (monitorId: string, endpointId: string, projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (interval: number) => monitorService.updateMonitor({ monitorId, interval }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endpoint', endpointId] });
            queryClient.invalidateQueries({ queryKey: ['endpoints', projectId] });
            queryClient.invalidateQueries({ queryKey: ['monitor-auth-status', monitorId] });
            toast.success('Monitor check interval updated successfully!');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || 'Failed to update monitor interval';
            toast.error(message);
        }
    });
};

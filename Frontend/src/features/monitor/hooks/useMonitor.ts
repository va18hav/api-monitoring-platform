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

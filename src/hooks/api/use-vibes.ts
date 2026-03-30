'use client';

import { 
    useLiveVibesControllerFindAllInfinite,
    useLiveVibesControllerFindAll as _useLiveVibesControllerFindAll,
    useLiveVibesControllerCreate 
} from '@/api/generated/live-vibes/live-vibes';
import { getNextSkipFromPage } from './base';

export function useLiveVibes(params?: { spotId?: string; cityId?: string; take?: number }) {
    const query = _useLiveVibesControllerFindAll({
        ...params,
        take: (params?.take || 10).toString()
    }, {
        query: {
            queryKey: ['live-vibes', params],
            staleTime: 60 * 1000,
        }
    });
    return { ...query, data: query.data?.data?.data || [] };
}

export function useInfiniteLiveVibes(params?: { spotId?: string; cityId?: string; categoryId?: string; take?: number }) {
    return useLiveVibesControllerFindAllInfinite({
        ...params,
        take: (params?.take || 10).toString()
    }, {
        query: {
            queryKey: ['live-vibes-infinite', params],
            staleTime: 60 * 1000,
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, false),
        }
    });
}

export function useCreateLiveVibe() {
    const mutation = useLiveVibesControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; crowdLevel: number; waitTimeMinutes?: number }) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; crowdLevel: number; waitTimeMinutes?: number }) => mutation.mutateAsync({ data: payload })
    };
}

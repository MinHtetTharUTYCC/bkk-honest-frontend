'use client';

import { 
    useCommunityTipsControllerFindBySpotInfinite,
    useCommunityTipsControllerFindBySpot,
    useCommunityTipsControllerCreate,
    useCommunityTipsControllerUpdate,
    useCommunityTipsControllerDelete
} from '@/api/generated/community-tips/community-tips';
import { getNextSkipFromPage } from './base';

export function useSpotTips(spotId: string) {
    const params = { type: 'TRY' as const, sort: 'popular' as const };
    const query = useCommunityTipsControllerFindBySpot(spotId, params, { query: { enabled: !!spotId } });
    return { ...query, data: query.data?.data?.data || [] };
}

export function useInfiniteSpotTips(
    spotId: string,
    type: 'TRY' | 'AVOID',
    sort: 'newest' | 'popular' = 'popular',
) {
    const normalizedType = type === 'TRY' 
      ? 'TRY' 
      : 'AVOID';
      
    const normalizedSort = sort === 'popular'
      ? 'popular'
      : 'newest';

    return useCommunityTipsControllerFindBySpotInfinite(spotId, {
        type: normalizedType,
        sort: normalizedSort,
        take: 10,
    }, {
        query: {
            queryKey: ['tips-infinite', spotId, normalizedType, normalizedSort],
            staleTime: 5 * 60 * 1000,
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
        },
    });
}

export function useCreateCommunityTip() {
    const mutation = useCommunityTipsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; type: 'TRY' | 'AVOID'; title: string; description: string }) => 
            mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; type: 'TRY' | 'AVOID'; title: string; description: string }) => 
            mutation.mutateAsync({ data: payload })
    };
}

export function useUpdateCommunityTip() {
    const mutation = useCommunityTipsControllerUpdate();
    return {
        ...mutation,
        mutate: (payload: { id: string; spotId: string; type?: 'TRY' | 'AVOID'; title?: string; description?: string }) => {
            const { id, ...data } = payload;
            return mutation.mutate({ id, data });
        },
        mutateAsync: (payload: { id: string; spotId: string; type?: 'TRY' | 'AVOID'; title?: string; description?: string }) => {
            const { id, ...data } = payload;
            return mutation.mutateAsync({ id, data });
        }
    };
}

export function useDeleteCommunityTip() {
    const mutation = useCommunityTipsControllerDelete();
    return {
        ...mutation,
        mutate: ({ id }: { id: string; _spotId: string }) => mutation.mutate({ id }),
        mutateAsync: ({ id }: { id: string; _spotId: string }) => mutation.mutateAsync({ id })
    };
}

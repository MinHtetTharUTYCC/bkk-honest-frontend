'use client';

import { 
    useSpotsControllerFindOne, 
    useSpotsControllerFindBySlug, 
    useSpotsControllerFindAll, 
    useSpotsControllerFindNearby, 
    useSpotsControllerSearch, 
    useSpotsControllerFindAllInfinite,
    useSpotsControllerCreate,
    useSpotsControllerUpdate,
    useSpotsControllerReverseGeocode
} from '@/api/generated/spots/spots';
import type { 
    SpotWithStatsResponseDto,
    PaginatedSpotsWithStatsResponseDto,
    CreateSpotDto,
    SpotsControllerFindAllParams,
    SpotsControllerFindNearbyParams,
    SpotsControllerSearchParams
} from '@/api/generated/model';
import { getNextSkipFromPage } from './base';

export function useSpot(id: string) {
    const query = useSpotsControllerFindOne(id, { query: { enabled: !!id } });
    const data = (query.data as PaginatedSpotsWithStatsResponseDto | undefined)?.data || query.data;
    return { ...query, data };
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
    const query = useSpotsControllerFindBySlug(citySlug, spotSlug, { query: { enabled: !!citySlug && !!spotSlug } });
    const data = (query.data as PaginatedSpotsWithStatsResponseDto | undefined)?.data || query.data;
    return { ...query, data };
}

export function useSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
}) {
    const cleanParams: SpotsControllerFindAllParams = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
    }

    const query = useSpotsControllerFindAll(cleanParams, { query: { staleTime: 5 * 60 * 1000 } });
    return { ...query, data: query.data?.data ? (Array.isArray(query.data.data) ? query.data.data : [query.data.data]) : [] };
}

export function useInfiniteSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
    take?: number;
}) {
    const cleanParams: SpotsControllerFindAllParams = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
        cleanParams.take = params.take || 10;
    }

    return useSpotsControllerFindAllInfinite(cleanParams, {
        query: {
            queryKey: ['spots-infinite', cleanParams],
            getNextPageParam: (lastPage: PaginatedSpotsWithStatsResponseDto) => getNextSkipFromPage(lastPage),
            staleTime: 5 * 60 * 1000,
        }
    });
}

export function useNearbySpots(params: SpotsControllerFindNearbyParams & { latitude: number; longitude: number }, enabled = true) {
    const query = useSpotsControllerFindNearby(params, {
        query: {
            queryKey: ['spots-nearby', params],
            enabled: enabled && !!params.latitude && !!params.longitude,
            placeholderData: (prev: PaginatedSpotsWithStatsResponseDto | undefined) => prev,
            staleTime: 60_000
        }
    });
    
    // Backend returns { data: SpotWithStatsResponseDto[] }
    const rawData = query.data as PaginatedSpotsWithStatsResponseDto | SpotWithStatsResponseDto[] | undefined;
    const spots = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return { ...query, data: spots };
}

export function useSpotSearch(queryStr: string, cityId?: string, limit: number = 20) {
    const params: SpotsControllerSearchParams = { q: queryStr };
    if (cityId) params.cityId = cityId;
    if (limit !== 20) params.limit = limit;

    const query = useSpotsControllerSearch(params, {
        query: {
            queryKey: ['spot-search', queryStr, cityId],
            enabled: queryStr.trim().length >= 1
        }
    });
    
    // Handle both direct array and wrapped response
    const rawData = query.data as PaginatedSpotsWithStatsResponseDto | SpotWithStatsResponseDto[] | undefined;
    const spots = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    return { ...query, data: spots };
}

export function useCreateSpot() {
    const mutation = useSpotsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: CreateSpotDto) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: CreateSpotDto) => mutation.mutateAsync({ data: payload })
    };
}

export function useUpdateSpot() {
    const mutation = useSpotsControllerUpdate();
    return {
        ...mutation,
        mutate: ({ id, payload }: { id: string; payload: Partial<SpotWithStatsResponseDto> }) => 
            mutation.mutate({ id, data: payload as unknown as Record<string, unknown> }),
        mutateAsync: ({ id, payload }: { id: string; payload: Partial<SpotWithStatsResponseDto> }) => 
            mutation.mutateAsync({ id, data: payload as unknown as Record<string, unknown> })
    };
}

export function useReverseGeocode() {
    const mutation = useSpotsControllerReverseGeocode();
    return {
        ...mutation,
        mutate: ({ latitude, longitude }: { latitude: number; longitude: number }) => 
            mutation.mutate({ data: { latitude, longitude } }),
        mutateAsync: ({ latitude, longitude }: { latitude: number; longitude: number }) => 
            mutation.mutateAsync({ data: { latitude, longitude } })
    };
}

// --- Popular Area (deprecated, returns empty) ---
export function usePopularArea() {
    return { data: null, isLoading: false, error: null };
}

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
import { getNextSkipFromPage } from './base';

export function useSpot(id: string) {
    const query = useSpotsControllerFindOne(id, { query: { enabled: !!id } });
    return { ...query, data: query.data?.data };
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
    const query = useSpotsControllerFindBySlug(citySlug, spotSlug, { query: { enabled: !!citySlug && !!spotSlug } });
    return { ...query, data: query.data?.data };
}

export function useSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
}) {
    const cleanParams: any = {};
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
    const cleanParams: any = {};
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
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
            staleTime: 5 * 60 * 1000,
        }
    });
}

export function useNearbySpots(params: { latitude: number; longitude: number; distance?: number; categoryId?: string; limit?: number }, enabled = true) {
    const query = useSpotsControllerFindNearby(params, {
        query: {
            queryKey: ['spots-nearby', params],
            enabled: enabled && !!params.latitude && !!params.longitude,
            placeholderData: (prev: any) => prev,
            staleTime: 60_000
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useSpotSearch(queryStr: string, cityId?: string, limit: number = 20) {
    const params: any = { q: queryStr };
    if (cityId) params.cityId = cityId;
    if (limit !== 20) params.limit = limit;

    const query = useSpotsControllerSearch(params, {
        query: {
            queryKey: ['spot-search', queryStr, cityId],
            enabled: queryStr.trim().length >= 1
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useCreateSpot() {
    const mutation = useSpotsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: {
            name: string;
            address: string;
            categoryId: string;
            cityId: string;
            latitude: number;
            longitude: number;
            image?: File;
        }) => mutation.mutate({ data: payload as any }),
        mutateAsync: (payload: {
            name: string;
            address: string;
            categoryId: string;
            cityId: string;
            latitude: number;
            longitude: number;
            image?: File;
        }) => mutation.mutateAsync({ data: payload as any })
    };
}

export function useUpdateSpot() {
    const mutation = useSpotsControllerUpdate();
    return {
        ...mutation,
        mutate: ({ id, payload }: { id: string; payload: any }) => mutation.mutate({ id, data: payload }),
        mutateAsync: ({ id, payload }: { id: string; payload: any }) => mutation.mutateAsync({ id, data: payload })
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

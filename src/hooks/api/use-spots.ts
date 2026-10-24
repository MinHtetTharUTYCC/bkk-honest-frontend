'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { openApiClient } from '@/lib/api/openapi-client';
import type { components } from '@/types/api-models';
import type {
    PaginatedSpotsWithStatsResponseDto,
    SpotSearchDto,
    SpotWithStatsResponseDto,
} from '@/types/api-models';
import { getNextSkipFromPage } from './base';

type SpotsControllerFindAllParams = {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
    take?: number;
    skip?: number;
};

type SpotsControllerFindNearbyParams = {
    latitude: number;
    longitude: number;
    distance?: number;
    categoryId?: string;
    limit?: number;
};

type SpotsControllerSearchParams = {
    q?: string;
    cityId?: string;
    limit?: number;
};

type CreateSpotInput = {
    cityId: string;
    categoryId: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    image?: File;
};

type UpdateSpotInput = {
    cityId?: string;
    categoryId?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    image?: File;
};

import { throwApiError } from '@/lib/errors/throw-api-error';

function toSpotFormData(payload: CreateSpotInput | UpdateSpotInput): FormData {
    const formData = new FormData();
    const entries = Object.entries(payload) as Array<[string, unknown]>;

    for (const [key, value] of entries) {
        if (value === undefined || value === null) {
            continue;
        }

        if (value instanceof File) {
            formData.append(key, value);
            continue;
        }

        formData.append(key, String(value));
    }

    return formData;
}

export function useSpot(id: string) {
    return useQuery({
        queryKey: ['spot', id],
        enabled: !!id,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/spots/{id}', {
                params: { path: { id } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<SpotWithStatsResponseDto>(data);
        },
    });
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
    return useQuery({
        queryKey: ['spot-by-slug', citySlug, spotSlug],
        enabled: !!citySlug && !!spotSlug,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET(
                '/spots/by-slug/{citySlug}/{spotSlug}',
                {
                    params: { path: { citySlug, spotSlug } },
                },
            );

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<SpotWithStatsResponseDto>(data);
        },
    });
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

    const query = useQuery({
        queryKey: ['spots', cleanParams],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/spots', {
                params: { query: cleanParams },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedSpotsWithStatsResponseDto>(data);
        },
    });

    return { ...query, data: query.data || [] };
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

    return useInfiniteQuery({
        queryKey: ['spots-infinite', cleanParams],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const { data, error } = await openApiClient.GET('/spots', {
                params: { query: { ...cleanParams, skip } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedSpotsWithStatsResponseDto>(data);
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        staleTime: 5 * 60 * 1000,
        initialPageParam: 0,
    });
}

export function useNearbySpots(
    params: SpotsControllerFindNearbyParams & {
        latitude: number;
        longitude: number;
    },
    enabled = true,
) {
    const query = useQuery({
        queryKey: ['spots-nearby', params],
        enabled: enabled && !!params.latitude && !!params.longitude,
        staleTime: 60_000,
        placeholderData: (previousData) => previousData,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/spots/nearby', {
                params: { query: params },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedSpotsWithStatsResponseDto>(data);
        },
    });

    const rawData = query.data as
        | PaginatedSpotsWithStatsResponseDto
        | SpotWithStatsResponseDto[]
        | undefined;
    const spots = Array.isArray(rawData) ? rawData : rawData?.data || [];
    return { ...query, data: spots };
}

export function useSpotSearch(queryStr: string, cityId?: string, limit: number = 20) {
    const params: SpotsControllerSearchParams = { q: queryStr };
    if (cityId) params.cityId = cityId;
    if (limit !== 20) params.limit = limit;

    const query = useQuery({
        queryKey: ['spot-search', queryStr, cityId],
        enabled: queryStr.trim().length >= 1,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/spots/search', {
                params: { query: params },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<SpotSearchDto[]>(data);
        },
    });

    return { ...query, data: query.data || [] };
}

export function useCreateSpot() {
    return useMutation({
        mutationKey: ['spots-create'],
        mutationFn: async (payload: CreateSpotInput | FormData) => {
            const body = payload instanceof FormData ? payload : toSpotFormData(payload);
            const { data, error } = await openApiClient.POST('/spots', {
                body: body as unknown as never,
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<SpotWithStatsResponseDto>(data) };
        },
    });
}

export function useUpdateSpot() {
    return useMutation({
        mutationKey: ['spots-update'],
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateSpotInput | FormData;
        }) => {
            const body = payload instanceof FormData ? payload : toSpotFormData(payload);
            const { data, error } = await openApiClient.PATCH('/spots/{id}', {
                params: { path: { id } },
                body: body as unknown as never,
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<SpotWithStatsResponseDto>(data) };
        },
    });
}

export function useDeleteSpot() {
    return useMutation({
        mutationKey: ['spots-delete'],
        mutationFn: async (id: string) => {
            const { data, error } = await openApiClient.DELETE('/spots/{id}', {
                params: { path: { id } },
            });

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<components['schemas']['MessageResponseDto']>(data),
            };
        },
    });
}

export function useReverseGeocode() {
    return useMutation({
        mutationKey: ['spots-reverse-geocode'],
        mutationFn: async () => {
            const { data, error } = await openApiClient.POST('/spots/reverse-geocode');

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<components['schemas']['GeocodeResponseDto']>(data),
            };
        },
    });
}

// --- Popular Area (deprecated, returns empty) ---
export function usePopularArea() {
    return { data: null, isLoading: false, error: null };
}

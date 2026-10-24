'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { openApiClient } from '@/lib/api/openapi-client';
import type { components } from '@/types/api-models';
import type { PaginatedScamAlertsResponseDto, ScamAlertResponseDto } from '@/types/api-models';
import { getNextSkipFromPage } from './base';
import { throwApiError } from '@/lib/errors/throw-api-error';

type ScamAlertsControllerFindAllParams = {
    skip?: number;
    take?: number;
    search?: string;
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
};

type CreateScamAlertInput = {
    scamName: string;
    description: string;
    preventionTip: string;
    cityId: string;
    categoryId: string;
    image?: File;
};

type UpdateScamAlertInput = {
    cityId?: string;
    categoryId?: string;
    scamName?: string;
    description?: string;
    preventionTip?: string;
    image?: File;
};

function toScamFormData(payload: CreateScamAlertInput | UpdateScamAlertInput): FormData {
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

export function useScamAlertBySlug(citySlug: string, alertSlug: string) {
    const query = useQuery({
        queryKey: ['scam-alert-by-slug', citySlug, alertSlug],
        enabled: !!citySlug && !!alertSlug,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET(
                '/scam-alerts/by-slug/{citySlug}/{alertSlug}',
                {
                    params: { path: { citySlug, alertSlug } },
                },
            );

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ScamAlertResponseDto>(data);
        },
    });
    return { ...query, data: query.data || [] };
}

export function useScamAlerts(params?: {
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
    search?: string;
    take?: number;
}) {
    const cleanParams: ScamAlertsControllerFindAllParams = {};
    if (params) {
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.sort) cleanParams.sort = params.sort;
        if (params.search) cleanParams.search = params.search;
        if (params.take) cleanParams.take = params.take;
    }

    const query = useQuery({
        queryKey: ['scam-alerts', cleanParams],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/scam-alerts', {
                params: { query: cleanParams },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedScamAlertsResponseDto>(data);
        },
    });
    return { ...query, data: query.data };
}

export function useInfiniteScamAlerts(params?: {
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
    search?: string;
    take?: number;
}) {
    const cleanParams: ScamAlertsControllerFindAllParams = {};
    if (params) {
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.sort) cleanParams.sort = params.sort;
        if (params.search) cleanParams.search = params.search;
        cleanParams.take = params.take || 10;
    }

    return useInfiniteQuery({
        queryKey: ['scam-alerts-infinite', cleanParams],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const { data, error } = await openApiClient.GET('/scam-alerts', {
                params: { query: { ...cleanParams, skip } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedScamAlertsResponseDto>(data);
        },
        staleTime: 5 * 60 * 1000,
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, false),
        initialPageParam: 0,
    });
}

export function useCreateScamAlert() {
    return useMutation({
        mutationKey: ['scam-alerts-create'],
        mutationFn: async (payload: CreateScamAlertInput | FormData) => {
            const body = payload instanceof FormData ? payload : toScamFormData(payload);
            const { data, error } = await openApiClient.POST('/scam-alerts', {
                body: body as unknown as never,
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<ScamAlertResponseDto>(data) };
        },
    });
}

export function useUpdateScamAlert() {
    return useMutation({
        mutationKey: ['scam-alerts-update'],
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateScamAlertInput | FormData;
        }) => {
            const body = payload instanceof FormData ? payload : toScamFormData(payload);
            const { data, error } = await openApiClient.PATCH('/scam-alerts/{id}', {
                params: { path: { id } },
                body: body as unknown as never,
            });

            if (error) {
                throwApiError(error);
            }

            return { data: unwrapApiSuccessData<ScamAlertResponseDto>(data) };
        },
    });
}

export function useDeleteScamAlert() {
    return useMutation({
        mutationKey: ['scam-alerts-delete'],
        mutationFn: async (id: string) => {
            const { data, error } = await openApiClient.DELETE('/scam-alerts/{id}', {
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

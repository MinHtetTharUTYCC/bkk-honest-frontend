'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { throwApiError } from '@/lib/errors/throw-api-error';
import { openApiClient } from '@/lib/api/openapi-client';
import type { CreateVoteResponseDto, ReportResponseDto } from '@/types/api-models';

export function useCreateVote() {
    return useMutation({
        mutationFn: async ({
            targetId,
            type,
        }: {
            targetId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            if (type === 'tip') {
                const { data, error } = await openApiClient.POST('/votes/tip', {
                    body: { communityTipId: targetId },
                });
                if (error) throwApiError(error);
                return { data: unwrapApiSuccessData<CreateVoteResponseDto>(data) };
            } else if (type === 'alert') {
                const { data, error } = await openApiClient.POST('/votes/alert', {
                    body: { scamAlertId: targetId },
                });
                if (error) throwApiError(error);
                return { data: unwrapApiSuccessData<CreateVoteResponseDto>(data) };
            } else if (type === 'image') {
                const { data, error } = await openApiClient.POST('/votes/image', {
                    body: { galleryImageId: targetId },
                });
                if (error) throwApiError(error);
                return { data: unwrapApiSuccessData<CreateVoteResponseDto>(data) };
            } else if (type === 'spot') {
                const { data, error } = await openApiClient.POST('/votes/spot', {
                    body: { spotId: targetId },
                });
                if (error) throwApiError(error);
                return { data: unwrapApiSuccessData<CreateVoteResponseDto>(data) };
            }
            throw new Error('Invalid vote type');
        },
    });
}

export function useDeleteVote() {
    return useMutation({
        mutationFn: async ({
            voteId,
            type: type,
        }: {
            voteId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            const { data, error } = await openApiClient.DELETE('/votes/{id}', {
                params: { path: { id: voteId } },
            });
            if (error) throwApiError(error);
            return unwrapApiSuccessData(data);
        },
    });
}

export function useCreateReport() {
    return useMutation({
        mutationKey: ['reports-create'],
        mutationFn: async (payload: {
            reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
            targetId: string;
            reason: string;
            description?: string;
        }) => {
            const { data, error } = await openApiClient.POST('/reports', {
                body: payload,
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ReportResponseDto>(data);
        },
    });
}

export function useGetReports(status?: string, limit = 10, offset = 0) {
    const query = useQuery({
        queryKey: ['reports', status, limit, offset],
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/reports', {
                params: {
                    query: {
                        status: status || '',
                        limit,
                        offset,
                    },
                },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ReportResponseDto[]>(data);
        },
    });
    return { ...query, data: query.data || [] };
}
